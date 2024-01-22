const APP_ID = "74c4c7dfdd84412b8cbb479df166e912";
const TOKEN =
  "007eJxTYPDaGMq46VXvyeaaFOHquRvm7KpQmGO5qPDLXPttDytCNm9TYDA3STZJNk9JS0mxMDExNEqySE5KMjG3TEkzNDNLtTQ0ygtYl9oQyMiw3iWSlZEBAkF8dobc/Oy8zLxUBgYAHVoh9A==";
const CHANNEL = "moknine";

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayStream = async () => {
  client.on("user-published", handleUserCall);
  client.on("user-left", handleLeaveCall);

  let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `<div class="video-container" id="user-container-${UID}">
  <div class="video-player" id="user-${UID}"></div>
  </div>`;

  document
    .getElementById("video_streams")
    .insertAdjacentHTML("beforeend", player);
  localTracks[1].play(`user-${UID}`);

  await client.publish([localTracks[0], localTracks[1]]);
};

let joinStream = async () => {
  await joinAndDisplayStream();
  document.getElementById("join_btn").style.display = "none";
  document.getElementById("stream_controls").style.display = "flex";
};

const handleUserCall = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }
    player = `<div class="video-container" id="user-container-${user.uid}">
    <div class="video-player" id="user-${user.uid}"></div>
    </div>`;
    document
      .getElementById("video_streams")
      .insertAdjacentHTML("beforeend", player);
    user.videoTrack.play(`user-${user.uid}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

const handleLeaveCall = (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

const LeaveAndRemoveCall = async () => {
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }
  await client.leave();
  document.getElementById("join_btn").style.display = "block";
  document.getElementById("stream_controls").style.display = "none";
  document.getElementById("video_streams").innerHTML = "";
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.innerText = "Mic on";
    e.target.style.backgroundColor = "gray";
  } else {
    await localTracks[0].setMuted(true);
    e.target.innerText = "Mic off";
    e.target.style.backgroundColor = "blue";
  }
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.innerText = "Camera on";
    e.target.style.backgroundColor = "gray";
  } else {
    await localTracks[1].setMuted(true);
    e.target.innerText = "Camera off";
    e.target.style.backgroundColor = "blue";
  }
};

document.getElementById("join_btn").addEventListener("click", joinStream);
document
  .getElementById("leave_btn")
  .addEventListener("click", LeaveAndRemoveCall);

document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("camera-btn").addEventListener("click", toggleCamera);
