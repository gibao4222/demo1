from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from spotify_user.models import SpotifyUser
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Reset VIP status for users after 30 days'

    def handle(self, *args, **options):
        vip_users = SpotifyUser.objects.filter(vip=True, vip_start_date__isnull=False)
        current_time = timezone.now()
        logger.info(f"Current time: {current_time}")

        for user in vip_users:
            if not user.vip_start_date:
                logger.warning(f"User {user.username} has vip=True but vip_start_date is None. Skipping.")
                continue

            time_elapsed = current_time - user.vip_start_date
            logger.debug(f"User {user.username}, VIP start date: {user.vip_start_date}, Time elapsed: {time_elapsed}")

            if time_elapsed > timedelta(days=30):
                logger.info(f"Resetting VIP for user {user.username}")
                user.vip = False
                user.vip_start_date = None
                user.save()
                logger.info(f"User {user.username} is no longer VIP")
            else:
                logger.debug(f"User {user.username} still within VIP period")

        self.stdout.write(self.style.SUCCESS('Successfully checked and reset VIP status'))