# 複雑なプロジェクトメモの例

ネスト、配列、型変換、インラインJSONを使った高度な例。

---

# Video Editing Project

## Project Info
- title: My Short Film
- duration: 120
- fps: 24
- resolution: 1920x1080

## Timeline
### Scene 1
- start: 0
- end: 30
- label: Opening
- has_audio: true
- has_vfx: false

### Scene 2
- start: 30
- end: 90
- label: Main Story
- has_audio: true
- has_vfx: true

### Scene 3
- start: 90
- end: 120
- label: Credits
- has_audio: true
- has_vfx: false

## Assets
- video_files: [clip_001.mp4, clip_002.mp4, clip_003.mp4]
- audio_files: [soundtrack.wav, sfx_01.wav]
- image_files: [logo.png, title_card.png]

## Export Settings
```json
{
  "codec": "h264",
  "bitrate": 8000,
  "audio_codec": "aac",
  "container": "mp4",
  "color_profile": "rec709"
}
```

## Tags
- color_grade
- vfx_compositing
- audio_mix
