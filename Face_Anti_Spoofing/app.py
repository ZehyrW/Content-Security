import argparse
import logging
import sys
import time
from typing import Dict, Generator

import cv2 as cv
import numpy as np
import yaml
import os
import dlib
import re
import pickle
from PIL import Image, ImageDraw, ImageFont
from aip import AipFace

from arcface import ArcFace, timer
from arcface import FaceInfo as ArcFaceInfo
from module.face_process import FaceProcess, FaceInfo
from module.image_source import LocalImage, ImageSource, LocalCamera
from module.text_renderer import put_text

from imutils.video import VideoStream
from imutils.video import FileVideoStream
from imutils import face_utils

from arcface import Gender
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

_logger = logging.getLogger(__name__)

font_path = r""
font = ImageFont.truetype(font_path, 20)

#百度API
APP_ID = ''
API_KEY = ''
SECRET_KEY = ''
client = AipFace(APP_ID, API_KEY, SECRET_KEY)

# 载入dlib的人脸检测器和特征模型
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
face_rec_model = dlib.face_recognition_model_v1('dlib_face_recognition_resnet_model_v1.dat')

@app.route('/')
def index():
    return render_template('index.html')

def load_features(filename='features.pkl'):
    with open(filename, 'rb') as f:
        return pickle.load(f)
# 载入人脸特征数据
features = load_features('features.pkl')

@timer(output=_logger.info)
def _parse_args() -> argparse.Namespace:
    """
    解析命令行参数
    :return: 解析后的结果
    """
    parser = argparse.ArgumentParser(
        description='ArcSoft Face SDK Demo'
    )
    parser.add_argument("--faces", metavar="人脸数据文件或者所在的目录")
    parser.add_argument("--faces-data", default='pics_doc', metavar="人脸数据库文件")
    parser.add_argument(
        "--source",
        help="视频数据来源，默认打开默认的摄像头。"
             "如果是图片文件路径，则使用图片"
             "如果是文件夹路径，则连续使用文件夹下的所有图片"
             "如果是视频路径，则使用视频文件"
    )
    # parser.add_argument("--single", action="store_true")
    args = parser.parse_args()

    # 读取配置文件
    with open("profile.yml", "r", encoding="utf-8") as file:
        profile: Dict[str, str] = yaml.load(file, yaml.Loader)
        args.app_id = profile["app-id"].encode()
        args.sdk_key = profile["sdk-key"].encode()
    return args


# def _frame_rate_statistics_generator() -> Generator[float, bool, None]:
#     """
#     统计视频帧率
#     :return:
#     """
#     count = 0
#     begin_time = time.time()
#     break_ = False
#     while not break_:
#         if count != 100:
#             fps = 0.0
#         else:
#             end_time = time.time()
#             fps = count / (end_time - begin_time)
#             count = 0
#             begin_time = time.time()
#         count += 1
#         break_ = yield fps


def _draw_face_info(image: np.ndarray, face_info: FaceInfo) -> None:
    """
    将人脸的信息绘制到屏幕上
    :param face_info: 人脸信息
    :return: None
    """
    # 绘制人脸位置
    rect = face_info.rect
    color = (255, 0, 0) if face_info.name else (0, 0, 255)
    cv.rectangle(image, rect.top_left, rect.bottom_right, color, 2)
    # 绘制人的其它信息
    x, y = rect.top_middle
    put_text(image, "%s" % face_info, bottom_middle=(x, y - 2))
    # 绘制人脸 ID
    # info = "%d" % face_info.arc_face_info.face_id
    # x, y = rect.top_left
    # put_text(image, info, left_top=(x + 2, y + 2))

# def _show_face_info(face_info: FaceInfo) -> None:
#     """
#     将人脸的信息输出
#     :param face_info: 人脸信息
#     :return: None
#     """
#     print(face_info.name)
#     print(face_info.threshold)
#     print('男'if face_info.gender == Gender.Male else '女')
#     print(face_info.age)
#     print('真'if face_info.liveness else '假') 

# def _show_image(image: np.ndarray) -> bool:
#     """
#     将图像在界面上显示出来
#     :param image: 需要显示的图像
#     :return: 如果需要退出就返回 True
#     """
#     # 显示到界面上
#     # cv.imshow("ArcFace Demo", image)
#     cv.imshow("arcface demo", image[::1, ::1])
#     key = cv.waitKey(1)

#     return key == ord('q') or key == ord('Q') or key == 27

def img2Base64(image):
    image = cv.imencode('.jpg', image)[1]
    base_data = str(base64.b64encode(image))[2:-1]
    return base_data

def draw_label(img, text, pos, font, font_color):
    img_pil = Image.fromarray(img)
    draw = ImageDraw.Draw(img_pil)
    draw.text(pos, text, font=font, fill=font_color)
    return np.array(img_pil)

def eye_aspect_ratio(eye):
    # (|e1-e5|+|e2-e4|) / (2|e0-e3|)
    A = np.linalg.norm(eye[1] - eye[5])
    B = np.linalg.norm(eye[2] - eye[4])
    C = np.linalg.norm(eye[0] - eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

def mouth_aspect_ratio(mouth):
    # (|m2-m9|+|m4-m7|)/(2|m0-m6|)
    A = np.linalg.norm(mouth[2] - mouth[9])  # 51, 59
    B = np.linalg.norm(mouth[4] - mouth[7])  # 53, 57
    C = np.linalg.norm(mouth[0] - mouth[6])  # 49, 55
    mar = (A + B) / (2.0 * C)
    return mar

def cosin_metric(x1, x2):
    return np.dot(x1, x2) / (np.linalg.norm(x1) * np.linalg.norm(x2))

def map_id_name(flod_path):
    image_map = {}
    for root, dirs, files in os.walk(flod_path):
        for file in files:
            filename = os.path.splitext(file)[0]
            user_id = re.findall(r'\d+', filename)[0]
            username = re.findall(r'[\u4e00-\u9fff]+', filename)[0]
            image_map[user_id] = username

    return image_map

# 识别人脸
def identify_face(face_descriptor, features):
    max_similarity = 0
    identity = "无法识别"
    for filename, saved_descriptor in features.items():
        similarity = cosin_metric(face_descriptor, saved_descriptor)
        if similarity <= 0.9:
            continue
        if similarity > max_similarity:
            max_similarity = similarity
            tmp1 = filename.split('-')
            tmp2 = tmp1[1].split('.')
            identity = tmp2[0]
            student_id = tmp1[0]
    return identity, student_id

def create_id2file_map():
    dataset_path = r'pics'
    entries = os.listdir(dataset_path)

    files = [entry for entry in entries if os.path.isfile(os.path.join(dataset_path, entry))]

    id_map = {}
    for file in files:
        parts = file.split('-')
        student_id = parts[0]
        id_map[student_id] = file
    # print(id_map)
    return id_map

def _help():
    print("Usage:")
    print("     python liveness_detect.py")
    print("     python liveness_detect.py <path of a video>")
    print("For example:")
    print("     python liveness_detect.py video/lee.mp4")
    print("If the path of a video is not provided, the camera will be used as the input.Press q to quit.")


# @socketio.on('handle_connect', namespace='/capture')
def api():
    face_info_data = {}
    args = _parse_args()

    ArcFace.APP_ID = args.app_id
    ArcFace.SDK_KEY = args.sdk_key

    if not args.faces and not args.faces_data:
        print("需要通过 --faces 指定包含人脸图片的文件或者目录")
        print("或者通过 --faces-data 指定已经生成好的人脸数据库")
        sys.exit(-1)

    face_process = FaceProcess()
    if args.faces and args.faces_data:
        with face_process:
            face_process.add_features(args.faces)
            face_process.dump_features(args.faces_data)
        return

    class AutoCloseOpenCVWindows:
        """
        用来在出现异常的情况下自动关闭用 OpenCV 显示的窗口
        """

        def __enter__(self):
            pass

        def __exit__(self, exc_type, exc_val, exc_tb):
            cv.destroyAllWindows()

    with face_process, AutoCloseOpenCVWindows():

        if args.faces:
            face_process.add_features(args.faces)
        else:
            face_process.load_features(args.faces_data)

        if args.source:
            image_source = LocalImage(args.source)
        else:
            image_source = LocalCamera()

        # run = _run_1_n if args.single else _run_m_n

        with image_source:
            # run(image_source, face_process)
            with ArcFace(ArcFace.VIDEO_MODE) as arcface:

                cur_face_info = None  # 当前的人脸

                # frame_rate_statistics = _frame_rate_statistics_generator()

                while True:
                    # 获取视频帧
                    image = image_source.read()

                    # 检测人脸
                    faces_pos = arcface.detect_faces(image)

                    if len(faces_pos) == 0:
                        # 图片中没有人脸
                        cur_face_info = None
                    else:
                        # 使用曼哈顿距离作为依据找出最靠近中心的人脸
                        center_y, center_x = image.shape[:2]
                        center_y, center_x = center_y // 2, center_x // 2
                        center_face_index = -1
                        min_center_distance = center_x + center_y + 4
                        cur_face_index = -1
                        for i, pos in enumerate(faces_pos):
                            if cur_face_info is not None and pos.face_id == cur_face_info.arc_face_info.face_id:
                                cur_face_index = i
                                break
                            x, y = pos.rect.center
                            if x + y < min_center_distance:
                                center_face_index = i
                                min_center_distance = x + y
                        if cur_face_index != -1:
                            # 上一轮的人脸依然在，更新位置信息
                            cur_face_info.arc_face_info = faces_pos[cur_face_index]
                        else:
                            # 上一轮的人脸不在了，选择当前所有人脸的最大人脸
                            cur_face_info = FaceInfo(faces_pos[center_face_index])

                    if cur_face_info is not None:
                        # 异步更新人脸的信息
                        if cur_face_info.need_update():
                            face_process.async_update_face_info(image, cur_face_info)

                        # _show_face_info(cur_face_info)
                            
                        # 绘制人脸信息
                        _draw_face_info(image, cur_face_info)

                        # cv.imwrite(f"frame.jpg", image)
                        ret, buffer = cv.imencode('.jpg', image)
                        byte_data = buffer.tobytes()
                        base64_data = base64.b64encode(byte_data).decode('utf-8')
                        socketio.emit('handle_capture', base64_data, namespace='/capture')

                        
                        name_parts = cur_face_info.name.split('-')
                        if len(name_parts) == 2:
                            student_id, student_name = name_parts
                        else:
                            student_id = cur_face_info.name
                            student_name = ''
                        # print(student_id)
                        # print(student_name)

                        base64_file = ''
                        full_path = os.path.join(r'pics', cur_face_info.name + '.png')

                        if os.path.exists(full_path):
                            img = cv.imdecode(np.fromfile(full_path, dtype=np.uint8), cv.IMREAD_COLOR)
                            ret, buffer = cv.imencode('.png', img)
                            byte_data = buffer.tobytes()
                            base64_data = base64.b64encode(byte_data).decode('utf-8')
                            base64_file = base64_data
                            # print(base64_file)
                        face_info_data['pic'] = base64_file

                        face_info_data = {
                            'name':student_name,
                            'id':student_id,
                            # 'name': cur_face_info.name,
                            'gender': '男' if cur_face_info.gender == Gender.Male else '女',
                            'age': cur_face_info.age,
                            'threshold': cur_face_info.threshold,
                            'liveness': '真' if cur_face_info.liveness else '假',
                            'pic': base64_file
                        }
                        socketio.emit('face_info_data', face_info_data, namespace='/capture')

def model():
    id_map = create_id2file_map()
    cap = cv.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        retval, buffer = cv.imencode('.jpg', frame)
        if retval:
            # 将图像数据转换为 base64 字符串
            jpg_as_text = base64.b64encode(buffer).decode()

        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
        faces = detector(gray)

        if len(faces) == 1:
            for face in faces:
                x1, y1, x2, y2 = face.left(), face.top(), face.right(), face.bottom()
                shape = predictor(gray, face)
                face_descriptor = np.array(face_rec_model.compute_face_descriptor(frame, shape))
                identity, student_id = identify_face(face_descriptor, features)

            #活体检测接口
                data = {
                    "image": jpg_as_text,
                    "image_type": "BASE64"
                }
                result = client.faceverify([data])
                print(type(result))

                live_status = result['result']['face_list'][0]['liveness']['livemapscore']
                liveness_score = 0
                if live_status > 0.44:
                    liveness_score = 1
                    final_live_status = '真'
                else:
                    final_live_status = '假'
                label = f"{student_id}-{identity},{live_status:.2f},{final_live_status}"  # 将整体结果作为标签

                cv.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 3)
                frame = draw_label(frame, label, (x1, y1 - 30), font, (255, 255, 255))
                ret, buffer = cv.imencode('.jpg', frame)
                byte_data = buffer.tobytes()
                base64_data = base64.b64encode(byte_data).decode('utf-8')
                socketio.emit('handle_capture', base64_data, namespace='/capture')
                filename = id_map[student_id]
                base64_file = ''
                full_path = os.path.join(r'pics', filename)
                if os.path.exists(full_path):
                    img = cv.imdecode(np.fromfile(file=full_path, dtype=np.uint8), cv.IMREAD_COLOR)
                    ret, buffer = cv.imencode('.jpg', img)
                    byte_data = buffer.tobytes()
                    base64_data = base64.b64encode(byte_data).decode('utf-8')
                    base64_file = base64_data
                face_info_data2 = {
                    'name': identity,
                    'student_id': student_id,
                    'threshold': live_status,
                    'liveness': '真' if liveness_score else '假',
                    'picture': base64_file
                }
                socketio.emit('face_info_data2', face_info_data2, namespace='/capture')

def model_2():
    if len(sys.argv) > 2 or "-h" in sys.argv or "--help" in sys.argv:
        _help()
    elif len(sys.argv) == 2:
        video_stream = FileVideoStream(sys.argv[1]).start()
        file_stream = True
        vs = video_stream
    else:
        video_stream = VideoStream(src=0).start()
        file_stream = False
        vs = video_stream
    # video_stream = VideoStream(src=0).start()
    # file_stream = False
    # vs = video_stream

    MAR_THRESH = 0.6
    mar_flag = 0
    mar_count = 0
    mar_time = 0
    print('program starts!')
    (mStart, mEnd) = face_utils.FACIAL_LANDMARKS_IDXS["mouth"]

    Liveness = False    
    state = False
    print("[INFO] starting video stream thread...")
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
    client = AipFace(APP_ID, API_KEY, SECRET_KEY)
    id_map = map_id_name(r'pics')
    while True:
        if file_stream and not vs.more():
            break

        frame = vs.read()
        if frame is not None:
            # print('kaishi')
            gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
            faces = detector(gray, 0)

            if len(faces) == 1:
                for face in faces:
                    x1, y1, x2, y2 = face.left(), face.top(), face.right(), face.bottom()
                face64 = img2Base64(frame)
                img_Type = 'BASE64'
                groupIdList = '1'

                if state == False and len(faces) != 0:
                    print('人脸搜索')
                    ret = client.search(face64, img_Type, groupIdList)
                    print(ret)
                    if ret['error_msg'] == 'SUCCESS':
                        userid = ret['result']['user_list'][0]['user_id']
                        print(userid + '识别成功')

                        state = True

                if Liveness:
                    final_live_status = '真'
                    label = f'{userid}-{id_map[userid]},{final_live_status}'
                    frame = draw_label(frame, label, (x1, y1 - 30), font, (255, 255, 255))
                else:
                    final_live_status = '假'
                    label = f'{userid}-{id_map[userid]},{final_live_status}'
                    frame = draw_label(frame, label, (x1, y1 - 30), font, (255, 255, 255))

                cv.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 3)
                shape = predictor(gray, faces[0])
                shape = face_utils.shape_to_np(shape)

                mouth = shape[mStart:mEnd]
                mar = mouth_aspect_ratio(mouth)

                if mar > MAR_THRESH and mar_flag == 0:
                    mar_time += 1 
                    if mar_time >= 5:
                        mar_count += 0.5
                        mar_flag = 1
                        mar_time = 0
                elif mar < MAR_THRESH and mar_flag == 1:
                    mar_time += 1
                    if mar_time >= 5:
                        mar_count += 0.5
                        mar_flag = 0
                        mar_time = 0        
                
                if mar_count >= 2:
                    Liveness = True
                    cv.putText(frame, "real", (0, 100),
                            cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
                else:
                    cv.putText(frame, "open mouth({}/2)".format(round(mar_count)), (0, 100),
                            cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
            
            ret, buffer = cv.imencode('.jpg', frame)
            byte_data = buffer.tobytes()
            base64_data = base64.b64encode(byte_data).decode('utf-8')
            socketio.emit('handle_capture', base64_data, namespace='/capture')
            student_id = userid
            identity = id_map[userid]
            base64_file = ''
            filename  = student_id + '-' + identity
            file_path = os.path.join(r'pics',  filename)
            supported_formats = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']

            for ext in supported_formats:
                full_path = file_path + ext
                if os.path.exists(full_path):
                    full_path2 = full_path
                    break
            if os.path.exists(full_path2):
                img = cv.imdecode(np.fromfile(file=full_path2, dtype=np.uint8), cv.IMREAD_COLOR)
                ret, buffer = cv.imencode('.jpg', img)
                byte_data = buffer.tobytes()
                base64_data = base64.b64encode(byte_data).decode('utf-8')
                base64_file = base64_data
            face_info_data3 = {
                    'name': identity,
                    'student_id': student_id,
                # 'threshold': live_status,
                    'liveness': '真' if Liveness else '假',
                    'picture': base64_file,
                }
            socketio.emit('face_info_data3', face_info_data3, namespace='/capture')
         


@socketio.on('handle_connect', namespace='/capture')
def handle_connect(data):
    type_info = data['type_info']
    if (type_info == 0):{
        api()
    }
    elif (type_info == 1):{
        model()
    }
    elif (type_info == 2):{
        model_2()
    }


if __name__ == "__main__":
    logging.basicConfig(
        # format="[%(levelname)s] %(message)s [%(threadName)s:%(name)s:%(lineno)s]",
        level=logging.INFO
    )
    socketio.run(app, debug=True, port=5000)
    # main()
