import os
import dlib
import numpy as np
from PIL import Image
import pickle

# 加载dlib模型
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
face_rec_model = dlib.face_recognition_model_v1('dlib_face_recognition_resnet_model_v1.dat')

def load_image(img_path):
    try:
        # 加载图像为灰度模式
        image = Image.open(img_path).convert('L')  # 使用 'L' 来获取灰度图像
        image = np.array(image)
        # dlib期望的是RGB图像，因此即使使用灰度图像，也需要将其转换为三通道格式
        image = np.stack([image]*3, axis=-1)  # 将灰度图像复制到三个通道
        return image
    except Exception as e:
        print(f"加载图片错误: {e}")
        return None

def get_featuresdict(dir):
    file_list = os.listdir(dir)
    person_dict = {}
    for filename in file_list:
        img_path = os.path.join(dir, filename)
        img = load_image(img_path)
        if img is not None:
            faces = detector(img, 1)
            if len(faces) > 0:
                shape = predictor(img, faces[0])
                face_descriptor = face_rec_model.compute_face_descriptor(img, shape)
                person_dict[filename] = np.array(face_descriptor)
                print(f"{img_path}处理完成")
            else:
                print(f"在{img_path}中未检测到人脸")
    return person_dict

def save_features(dir):
    features = get_featuresdict(dir)
    with open('features.pkl', 'wb') as f:
        pickle.dump(features, f)

if __name__ == '__main__':
    image_directory = "pics"  # 包含图片的目录
    save_features(image_directory)
