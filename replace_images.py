import os

replacements = {
    "/assets/images/Farmer pointing.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987201/Farmer_pointing_sz8tpb.png",
    "/assets/images/Frame 10 end.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987192/Frame_10_end_nmhghb.png",
    "/assets/images/frame.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987188/frame_z8diw9.png",
    "/assets/images/Volume Button.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987183/Volume_Button_rbcsnh.png",
    "/assets/images/Frame 8 end.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987183/Frame_8_end_a0vnf9.png",
    "/assets/images/Frame 9 end.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987182/Frame_9_end_lxlgct.png",
    "/assets/images/Timer BG.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987181/Timer_BG_jlcuv2.png",
    "/assets/images/Settings BG.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987180/Settings_BG_ik5m31.png",
    "/assets/images/Name and number pannel.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987179/Name_and_number_pannel_f1d4th.png",
    "/assets/images/Happiness Meter BG.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987176/Happiness_Meter_BG_c9f90p.png",
    "/assets/images/Frame 6 end.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987175/Frame_6_end_litact.png",
    "/assets/images/Frame 7 end.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987173/Frame_7_end_kbmw1m.png",
    "/assets/images/Frame 5 end.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987173/Frame_5_end_orxgvl.png",
    "/assets/images/BG.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987108/BG_ndaicp.png",
    "/assets/images/Button 1.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987108/Button_1_jkg2sk.png",
    "/assets/images/Correct answer BG.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987104/Correct_answer_BG_gqw0az.png",
    "/assets/images/Button 2.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987103/Button_2_clkrap.png",
    "/assets/images/Buttons for letters.png": "https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987103/Buttons_for_letters_jupmbj.png"
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
                
            if new_content != content:
                print(f"Updated {filepath}")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
