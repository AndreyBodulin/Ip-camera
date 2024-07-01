const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3010;

// Путь к папке, где будут храниться HLS сегменты и плейлисты
const hlsDir = path.join(__dirname, "hls");
if (!fs.existsSync(hlsDir)) {
  fs.mkdirSync(hlsDir, { recursive: true });
}

app.use(cors());

// Функция для запуска ffmpeg
const startFFmpeg = () => {
  const ffmpeg = spawn("ffmpeg", [
    "-rtsp_transport",
    "udp",
    "-buffer_size",
    "100000k",
    "-i",
    "rtsp://admin:Qwerty123@192.168.1.37:554/cam/realmonitor?channel=1&subtype=0",
    // "-rtsp_transport",
    // "tcp",
    // "-buffer_size",
    // "100000k",
    // "-i",
    // rtspUrl_2,
    // "-rtsp_transport",
    // "tcp",
    // "-buffer_size",
    // "100000k",
    // "-i",
    // rtspUrl_3,
    // "-rtsp_transport",
    // "tcp",
    // "-buffer_size",
    // "100000k",
    // "-i",
    // rtspUrl_4,
    // "-rtsp_transport",
    // "tcp",
    // "-buffer_size",
    // "100000k",
    // "-i",
    // rtspUrl_5,
    // "-rtsp_transport",
    // "tcp",
    // "-buffer_size",
    // "100000k",
    // "-i",
    // rtspUrl_6,
    "-map",
    "0:v",
    "-codec:v",
    "libx264",
    "-f",
    "hls",
    "-hls_time",
    "10",
    "-hls_list_size",
    "5",
    "-hls_flags",
    "delete_segments",
    path.join(hlsDir, "stream6.m3u8"),
    // "-map",
    // "1:v",
    // "-codec:v",
    // "libx264",
    // "-f",
    // "hls",
    // "-hls_time",
    // "10",
    // "-hls_list_size",
    // "5",
    // "-hls_flags",
    // "delete_segments",
    // path.join(hlsDir, "stream2.m3u8"),
    // "-map",
    // "2:v",
    // "-codec:v",
    // "libx264",
    // "-f",
    // "hls",
    // "-hls_time",
    // "10",
    // "-hls_list_size",
    // "5",
    // "-hls_flags",
    // "delete_segments",
    // path.join(hlsDir, "stream3.m3u8"),
    // "-map",
    // "3:v",
    // "-codec:v",
    // "libx264",
    // "-f",
    // "hls",
    // "-hls_time",
    // "10",
    // "-hls_list_size",
    // "5",
    // "-hls_flags",
    // "delete_segments",
    // path.join(hlsDir, "stream4.m3u8"),
    // "-map",
    // "4:v",
    // "-codec:v",
    // "libx264",
    // "-f",
    // "hls",
    // "-hls_time",
    // "10",
    // "-hls_list_size",
    // "5",
    // "-hls_flags",
    // "delete_segments",
    // path.join(hlsDir, "stream5.m3u8"),
    // "-map",
    // "5:v",
    // "-codec:v",
    // "libx264",
    // "-f",
    // "hls",
    // "-hls_time",
    // "10",
    // "-hls_list_size",
    // "5",
    // "-hls_flags",
    // "delete_segments",
    // path.join(hlsDir, "stream6.m3u8"),
  ]);

  ffmpeg.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  ffmpeg.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
  });
};

const startFFmpegAll = (arr) => {
  const arrData = arr.reduce((acc, item) => {
    return [
      ...acc,
      `-rtsp_transport`,
      `udp`,
      `-buffer_size`,
      `100000k`,
      `-i`,
      item,
    ];
  }, []);

  const ffmpeg = spawn("ffmpeg", [
    ...arrData,
    "-filter_complex",
    "[0:v]scale=640:480[v0];[1:v]scale=640:480[v1];[2:v]scale=640:480[v2];[3:v]scale=640:480[v3];[4:v]scale=640:480[v4];[5:v]scale=640:480[v5];[v0][v1][v2][v3][v4][v5]xstack=inputs=6:layout=0_0|640_0|1280_0|0_480|640_480|1280_480[v]",
    "-map",
    "[v]",
    "-c:v",
    "libx264",
    "-f",
    "hls",
    "-hls_time",
    "10",
    "-hls_list_size",
    "5",
    "-hls_flags",
    "delete_segments",
    path.join(hlsDir, "streamAll.m3u8"),
  ]);
  ffmpeg.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  ffmpeg.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
  });
};

const getCamerasConfig = (item) => {
  const width = 640;
  const height = 480;
  const amountCam = item.length;
  const redAcc = {
    mainPart: "",
    secondPart: "",
    thirdPart: `xstack=inputs=${amountCam}:`,
    locationPart: "layout=",
  };
  const amountCameraMatrix = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ];

  const result = item.reduce((acc, cam, camIndex) => {
    acc.mainPart += `[${camIndex}:v]scale=${width}:${height}[v${camIndex}];`;
    acc.secondPart += `[v${camIndex}]`;
    acc.locationPart += `${width * amountCameraMatrix[camIndex][0]}_${
      height * amountCameraMatrix[camIndex][1]
    }${camIndex < amountCam - 1 ? "|" : "[v]"}`;

    return acc;
  }, redAcc);

  console.log("----------------------------");
  console.log(result);
  console.log("----------------------------");
  return result;
};
// "[0:v]scale=640:480[v0];[1:v]scale=640:480[v1];[2:v]scale=640:480[v2];[3:v]scale=640:480[v3];[4:v]scale=640:480[v4];[5:v]scale=640:480[v5];[v0][v1][v2][v3][v4][v5]xstack=inputs=6:layout=0_0|640_0|1280_0|0_480|640_480|1280_480[v]",
const localFFmpeg = (arr) => {
  const arrData = arr.reduce((acc, item) => {
    return [...acc, `-i`, "hls/" + item];
  }, []);
  const camerasConfig = getCamerasConfig(arr);

  const ffmpeg = spawn("ffmpeg", [
    ...arrData,
    "-filter_complex",
    `${camerasConfig.mainPart}${camerasConfig.secondPart}${camerasConfig.thirdPart}${camerasConfig.locationPart}`,
    "-map",
    "[v]",
    "-c:v",
    "libx264",
    "-f",
    "hls",
    "-hls_time",
    "10",
    "-hls_list_size",
    "5",
    "-hls_flags",
    "delete_segments",
    path.join(hlsDir, "streamAll.m3u8"),
  ]);
  ffmpeg.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  ffmpeg.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
  });
};

const Cam_obj = {
  cam_1: {
    name: "Угловая камера коридора правого крыла",
    rtsp: "rtsp://admin:Qwerty123@192.168.1.32:554/cam/realmonitor?channel=1&subtype=1",
    url: "streamV1.ts",
  },
  cam_2: {
    name: "Кабинет 301",
    rtsp: "rtsp://admin:Qwerty123@192.168.1.33:554/cam/realmonitor?channel=1&subtype=1",
    url: "streamV2.ts",
  },
  cam_3: {
    name: "Коридор правого крыла",
    rtsp: "rtsp://admin:Qwerty123@192.168.1.34:554/cam/realmonitor?channel=1&subtype=1",
    url: "streamV3.ts",
  },
  cam_4: {
    name: "Угловая камера коридора левого крыла",
    rtsp: "rtsp://admin:Qwerty123@192.168.1.35:554/cam/realmonitor?channel=1&subtype=1",
    url: "streamV4.ts",
  },
  cam_5: {
    name: "Холл",
    rtsp: "rtsp://admin:Qwerty123@192.168.1.36:554/cam/realmonitor?channel=1&subtype=1",
    url: "streamV5.ts",
  },
  cam_6: {
    name: "Коридор левого крыла",
    rtsp: "rtsp://admin:Qwerty123@192.168.1.37:554/cam/realmonitor?channel=1&subtype=1",
    url: "streamV6.ts",
  },
};

// Запускаем ffmpeg при старте сервера
// startFFmpeg();
//startFFmpegAll();

// Отдача HLS сегментов и плейлиста клиенту
// app.use("/hls", express.static(hlsDir));
app.use("/hls", express.static(path.join(__dirname, "hls")));
app.use(express.json());

app.get("/", (req, res) => {
  let data = JSON.stringify(Cam_obj);
  res.send(data);
});

app.post("/quad", (req, res) => {
  const payload = req.body;
  try {
    fs.unlinkSync("hls/streamAll.m3u8");
    fs.unlinkSync("hls/streamAll0.ts");
    fs.unlinkSync("hls/streamAll1.ts");
    fs.unlinkSync("hls/streamAll2.ts");
    fs.unlinkSync("hls/streamAll3.ts");
    fs.unlinkSync("hls/streamAll4.ts");
    fs.unlinkSync("hls/streamAll5.ts");
    console.log("Deleted");
    ffmpeg.killRunningProcess();
  } catch (e) {
    console.log(e);
  }
  localFFmpeg(payload.url);
  console.log("++++++++++++++++++++++", payload);
  // startFFmpegAll(payload.cams);
  const existTimer = setInterval(() => {
    try {
      if (fs.existsSync("hls/streamAll.m3u8")) {
        res.status(200).json({
          message: "success",
          // data: { streamUrl: "http://localhost:3010/hls/stream6.m3u8" },
          data: { streamUrl: "http://localhost:3010/hls/streamAll.m3u8" },
        });
        console.log("file exists");
        clearInterval(existTimer);
      }
    } catch {
      console.error("file does not exists");
    }
  }, 2000);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
