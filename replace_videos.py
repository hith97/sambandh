import os

replacements = {
    "/assets/Videos/Frame 2 BG.mp4": "https://res.cloudinary.com/dbyrmzuuw/video/upload/v1774077859/Frame_2_BG_qhrhma.mp4",
    "/assets/Videos/Frame 10 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774604523/Frame_10_sajhi9.mp4",
    "/assets/Videos/Frame 8 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774603454/Frame_8_smjeuf.mp4",
    "/assets/Videos/Frame 7 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774603453/Frame_7_cymima.mp4",
    "/assets/Videos/Frame 11 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774604522/Frame_11_rf9cwr.mp4",
    "/assets/Videos/Frame 5 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774603455/Frame_5_zg86lm.mp4",
    "/assets/Videos/Frame 9 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774603458/Frame_9_virfdk.mp4",
    "/assets/Videos/Frame 6 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774603445/Frame_6_ykt4pt.mp4",
    "/assets/Videos/Frame 12 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774604511/Frame_12_uley5c.mp4",
    "/assets/Videos/Frame 1 Video.mp4": "https://res.cloudinary.com/dfkraqvyy/video/upload/v1774604516/Frame_1_lwaq7r.mp4"
}

target_dir = r"c:\Users\artha\OneDrive\Desktop\Game\src"

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith((".js", ".jsx", ".css")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            for old_str, new_str in replacements.items():
                new_content = new_content.replace(old_str, new_str)
                # Handle URL-encoded spaces occasionally found in code
                url_encoded_old_str = old_str.replace(" ", "%20")
                if url_encoded_old_str != old_str:
                    new_content = new_content.replace(url_encoded_old_str, new_str)
                
            if new_content != content:
                print(f"Updated {filepath}")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
