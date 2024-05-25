# 内容安全综合设计实验

## 项目结构(Face Anti-Spoofing)

```text
lib/            # 存放 ArcFace SDK 库
  windows_64/
arcface/        # 用 Python 对 ArcFace SDK 封装的模块
  arcface.py                # ArcFace SDK 的 Python 接口
  arcsoft_face_func.py      # ArcFace SDK 里提供的函数
  arcsoft_face_struct.py    # ArcFace SDK 里有的结构体
  tools.py                  # 内包含一些辅助工具
module/         # API依赖的关键模块
  face_process.py           # 调用 ArcFace，集成人脸识别、活体检测等异步操作
  image_source.py           # 提供视频帧
  text_renderer.py          # 渲染中文
pics/		        # 存放人脸数据
static/		      # 编译得到的静态链接
templates/      # 编译得到的index文件
  index.html
profile.yml     # Demo 的配置文件
demo.py         # 生成人脸数据库缓存
get_features.py # 生成人脸数据库特征向量
app.py		      # Demo展示
```

## 操作指导

1. 安装 [Python 3.7](https://www.python.org/downloads)。
2. 安装模块 [opencv-python](https://pypi.org/project/opencv-python)、[freetype](https://pypi.org/project/freetype-py)、[PyYAML](https://pypi.org/project/PyYAML)。可通过 `python -m pip install opencv-python freetype-py PyYAML` 安装需要的全部依赖。
3. 从 [ArcSoft 官网](https://ai.arcsoft.com.cn/product/arcface.html)授权申请 SDK，下载相应版本的 SDK 并解压。
4. 将 `lib` 中的所有动态库拷贝到 `lib` 目录中对应的平台目录下。
5. 准备好人脸数据库，即一张或者多张包含人脸的图片（最好一张图片仅包含一张清晰的人脸）。将这些图片一起放在同一个目录下，目录的路径最好没有中文也没有空格。
6. 准备一个摄像头或者一个视频，图片也行。
7. 在 [profile.yml](profile.yml) 中配置你的 `APP ID` 和 `SDK KEY`。
8. 通过 `python demo.py --faces <人脸数据库文件路径> --faces-data <缓存人脸数据库文件的路径>` 来生成人脸数据库的缓存，加快下次启动的速度。 
9. 通过 `python get_features.py`获取人脸库中所有人特征
10. 执行`python app.py`

> 需要将上面的 <> 中的内容及 <> 自身替换成满足 <> 中说明的实际内容。 
> 图片（不包括 GIF）和视频的格式需要能被 OpenCV 支持的格式。

### 运行效果说明

当检测到人脸时在人脸数据库中，人脸框变蓝。  
人脸框上面有五个信息，分别用 `,` 隔开。这五个信息分别是 `姓名`, `相似度`, `活体结果`, `性别`, `年龄`（每种方案结果不完全相同）。

## 相关链接

- [shape_predictor_68_face_landmarks.dat](http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2)
- [dlib_face_recognition_resnet_model_v1.dat](http://dlib.net/files/)

> 下载上述模型到Face Anti-Spoofing文件夹内

## 流程图
![image][../Face_Anti_Spoofing/process.png]
