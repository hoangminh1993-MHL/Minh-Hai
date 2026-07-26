import json, re

def clean_text(s):
    if not isinstance(s, str):
        return s
    
    # Decoders for specific lead names & notes
    s = re.sub(r'Kh├ích Messenger Remote', 'Khách Messenger Remote', s)
    s = re.sub(r'Kh├ích Messenger 999', 'Khách Messenger 999', s)
    s = re.sub(r'Kh├ích Messenger', 'Khách Messenger', s)
    s = re.sub(r'D├║ng T├║c|D├║ng t├║c|D╞░╞íng T├│c', 'Dương Tóc', s)
    s = re.sub(r'Anh Ph╞░╞íng', 'Anh Phương', s)
    s = re.sub(r'Minh Nguyß╗àn', 'Minh Nguyễn', s)
    s = re.sub(r'Hu╞░╞íng Phß║ím|Hu╞░╞íng Phạ', 'Huơng Phạm', s)
    s = re.sub(r'Xu├ón H├ái ─É├¡nh|Xu├ón Hß║úi Đinh|Xuân Hải Dinh', 'Xuân Hải Đinh', s)
    s = re.sub(r'─É├¡nh Ph├║c An|Dinh Phúc An', 'Đinh Phúc An', s)
    s = re.sub(r'Ho├óng Th├╣y Du╞░╞íng', 'Hoàng Thùy Dương', s)
    s = re.sub(r'Phß║ím Thuß║¡n', 'Phạm Thuận', s)
    s = re.sub(r'Mai Hß╗Öng VPP', 'Mai Hồng VPP', s)
    s = re.sub(r'Ho├óng Ph├ít Koffmann', 'Hoàng Phát Koffmann', s)
    s = re.sub(r'V├▓ng bi Ph├║ Qu├╜', 'Vòng bi Phú Quý', s)
    s = re.sub(r'Nha Phuong B├╣i', 'Nha Phuong Bùi', s)
    s = re.sub(r'Quß╗æc Kh├ính', 'Quốc Khánh', s)
    s = re.sub(r'Minh T├ím', 'Minh Tâm', s)
    s = re.sub(r'Bß║úo Ngß╗ìc Rice', 'Bảo Ngọc Rice', s)
    s = re.sub(r'S╞í n Quang L├ím', 'Sơn Quang Lâm', s)
    s = re.sub(r'Phß║ím Thß╗ï Anh Ngß╗ìc', 'Phạm Thị Anh Ngọc', s)
    s = re.sub(r'Ho├óng C╞░╞íng Biz', 'Hoàng Cường Biz', s)
    s = re.sub(r'V┼⌐ Ngß╗ìc Huyß╗ün', 'Vũ Ngọc Huyền', s)
    s = re.sub(r'Trß║ºn Hiß║┐u', 'Trần Hiếu', s)
    s = re.sub(r'H╞░╞íng V┼⌐', 'Hương Vũ', s)
    s = re.sub(r'Ruby Nguyß╗ün', 'Ruby Nguyễn', s)
    s = re.sub(r'Diß╗åm Quß╗│nh|Điß╗âm Quß╗│nh', 'Điểm Quỳnh', s)

    # Stage names
    s = s.replace('Nhß║¡n th├┤ng tin', 'Nhận thông tin')
    s = s.replace('Lß║Ñy S─ÉT', 'Lấy SĐT')
    s = s.replace('Khai th├c th├┤ng tin', 'Khai thác thông tin')
    s = s.replace('B├o gi├', 'Báo giá')
    s = s.replace('Th╞░╞ng l╞░ß╗ng', 'Thương lượng')
    s = s.replace('Th├nh c├┤ng', 'Thành công')
    s = s.replace('Thß║Ñt bß║i', 'Thất bại')

    # Character-level CP437 mapping
    replacements = [
        ('─É', 'Đ'), ('─æ', 'đ'), ('├║', 'ú'), ('├í', 'á'), ('├¡', 'í'), ('├┤', 'ô'),
        ('├¬', 'ê'), ('├á', 'à'), ('├¿', 'è'), ('├╣', 'ù'), ('├╜', 'ý'),
        ('ß╗a', 'ẩ'), ('ß╗å', 'ổ'), ('ß╗à', 'ề'), ('ß╗ï', 'ị'), ('ß╗ì', 'ỉ'),
        ('ß╗Å', 'ỏ'), ('ß╗ü', 'ụ'), ('ß╗ñ', 'ủ'), ('ß╗ª', 'ữ'), ('ß╗¿', 'ừ'),
        ('ß╗«', 'ứ'), ('ß╗░', 'ử'), ('ß╗▓', 'ữ'), ('ß║ím', 'ạm'), ('ß║í', 'ạ'),
        ('ß║º', 'ầ'), ('ß║┐', 'ế'), ('ß║╜', 'ẽ'), ('ß║╖', 'ặt'), ('ß╗ö', 'ố'),
        ('ß║╢', 'ắ'), ('ß║¡', 'ận'), ('ß║╟', 'ẵ'), ('ß║«', 'ẳ'), ('ß║▒', 'ằ'),
        ('ß║¯', 'ắ'), ('ß║£', 'ả'), ('ß║¥', 'ấ'), ('ß║§', 'ẩ'), ('ß║¨', 'ẫ'),
        ('ß║©', 'ậ'), ('ß║ª', 'ẽ'), ('ß║®', 'ẽ'), ('ß║°', 'ề'), ('ß║±', 'ể'),
        ('ß║²', 'ễ'), ('ß║³', 'ệ'), ('ß║´', 'ỉ'), ('ß║¶', 'ọ'), ('ß║·', 'ỏ'),
        ('ß║¸', 'ố'), ('ß║º', 'ổ'), ('ß║»', 'ỗ'), ('ß║¼', 'ộ'), ('ß║½', 'ớ'),
        ('ß║¾', 'ờ'), ('ß║¿', 'ở'), ('b─âng', 'băng'), ('l╞░ß╗¢i', 'lưới'),
        ('th╞░ß╗¥ng', 'thường'), ('k├¡ch', 'kích'), ('th╞░ß╗¢c', 'thước'),
        ('bß║n', 'bản'), ('rß╗Öng', 'rộng'), ('nß║╖ng', 'nặng')
    ]
    for old, new in replacements:
        s = s.replace(old, new)

    return s

def clean_obj(obj):
    if isinstance(obj, dict):
        return {k: clean_obj(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_obj(item) for item in obj]
    elif isinstance(obj, str):
        return clean_text(obj)
    else:
        return obj

with open('db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cleaned_data = clean_obj(data)

with open('db.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

print("Python clean_db.py executed successfully!")
