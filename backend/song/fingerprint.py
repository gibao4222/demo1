import librosa
import numpy as np
import json
from pydub import AudioSegment
import tempfile
import os

def get_audio_fingerprint(file_path, sr=22050, n_fft=2048, hop_length=512, n_mels=128):
    """
    Tạo fingerprint từ file audio sử dụng Mel Spectrogram
    """
    try:
        # Chuyển đổi sang WAV nếu cần
        if not file_path.lower().endswith('.wav'):
            audio = AudioSegment.from_file(file_path)
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                audio.export(tmp.name, format='wav')
                y, sr = librosa.load(tmp.name, sr=sr)
                os.unlink(tmp.name)
        else:
            y, sr = librosa.load(file_path, sr=sr)
        
        # Chuẩn hóa độ dài (ví dụ: 30 giây)
        if len(y) > sr * 30:
            y = y[:sr*30]
        
        # Tạo Mel Spectrogram
        S = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=n_fft, 
                                          hop_length=hop_length, 
                                          n_mels=n_mels)
        
        # Chuyển đổi sang dB
        log_S = librosa.power_to_db(S, ref=np.max)
        
        return log_S
        
    except Exception as e:
        print(f"Error generating fingerprint: {e}")
        return None

def compare_fingerprints(fp1, fp2, threshold=0.8):
    """
    So sánh 2 fingerprints và trả về điểm tương đồng
    """
    try:
        if fp1 is None or fp2 is None:
            return 0.0
            
        # Chuyển đổi từ JSON string về numpy array nếu cần
        if isinstance(fp1, str):
            fp1 = np.array(json.loads(fp1))
        if isinstance(fp2, str):
            fp2 = np.array(json.loads(fp2))
        
        # Đảm bảo cùng kích thước
        min_shape = (min(fp1.shape[0], fp2.shape[0]), 
                    min(fp1.shape[1], fp2.shape[1]))
        fp1 = fp1[:min_shape[0], :min_shape[1]]
        fp2 = fp2[:min_shape[0], :min_shape[1]]
        
        # Tính toán correlation
        correlation = np.corrcoef(fp1.flatten(), fp2.flatten())[0, 1]
        
        # Chuẩn hóa về 0-1
        normalized_sim = (correlation + 1) / 2
        
        return normalized_sim if not np.isnan(normalized_sim) else 0.0
        
    except Exception as e:
        print(f"Error comparing fingerprints: {e}")
        return 0.0