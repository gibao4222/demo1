import os
import json
from django.core.management.base import BaseCommand
from django.db import transaction
from song.models import Song
from tqdm import tqdm
from song.fingerprint import get_audio_fingerprint

class Command(BaseCommand):
    help = 'Generate audio fingerprints for songs with null fingerprint field'

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=50,
            help='Number of songs to process in each batch'
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']

        songs = Song.objects.filter(
            file_audio__isnull=False,
            fingerprint__isnull=True
        ).exclude(file_audio__exact='')

        total = songs.count()
        self.stdout.write(f"Found {total} songs without fingerprints")

        processed = 0
        failed = 0
        skipped = 0

        for song in tqdm(songs, total=total, desc="Processing songs"):
            try:
                # Lấy đường dẫn tuyệt đối tới file
                file_field = song.file_audio
                if not file_field:
                    skipped += 1
                    continue

                file_path = file_field.path

                if not os.path.isfile(file_path):
                    self.stdout.write(f"\n[WARNING] File not found: {file_path}")
                    skipped += 1
                    continue

                # Tạo fingerprint
                fp = get_audio_fingerprint(file_path)
                if fp is None:
                    self.stdout.write(f"\n[WARNING] Fingerprint generation failed for {file_path}")
                    failed += 1
                    continue

                
                with transaction.atomic():
                    song.fingerprint = json.dumps(fp.tolist())
                    song.save(update_fields=['fingerprint'])
                    processed += 1

                if processed % batch_size == 0:
                    self.stdout.write(f"\nProcessed {processed}/{total} songs")

            except Exception as e:
                self.stdout.write(f"\n[ERROR] Song ID {song.id} - {str(e)}")
                failed += 1

        self.stdout.write("\n" + "="*50)
        self.stdout.write(f"Total songs: {total}")
        self.stdout.write(f"Successfully processed: {processed}")
        self.stdout.write(f"Failed: {failed}")
        self.stdout.write(f"Skipped (file not found): {skipped}")
