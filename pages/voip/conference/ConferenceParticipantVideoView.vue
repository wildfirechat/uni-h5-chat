<template>
    <div class="participant-video-item" :style="computedParticipantSizeStyle"
         v-bind:class="{highlight: participant._volume > 0}">
        <video v-if="!participant._isAudience && !participant._isVideoMuted && participant._stream"
               @dblclick="onDbClickVideo"
               ref="remoteVideoView"
               :style="computedParticipantSizeStyle"
               :srcObject.prop="participant._stream"
               :muted="participant.uid === selfUserId"
               class="video"
               autoplay="true"
        />
        <div v-else
             class="avatar-container">
            <image class="avatar" :src="participant.portrait" :alt="participant"/>
        </div>
        <video v-if="!participant._isAudience && participant.videoMuted && participant.uid !== selfUserId && participant._stream"
               :srcObject.prop="participant._stream"
               :muted="participant.uid === selfUserId"
               class="audio"
               autoPlay/>
        <div v-if="false && !participant._isVideoMuted" class="video-stream-tip-container">
            <p>{{ '双击视频，将其设置为焦点' }}</p>
        </div>
        <div class="info-container">
            <text v-if="participant._isHost" class="iconfont icon-ion-person"></text>
            <text v-if="participant._isAudioMuted" class="iconfont icon-ion-ios-mic-off" style="color: white"></text>
            <text v-else class="iconfont icon-ion-ios-mic"></text>
            <text class="name">{{ userName }}</text>
        </div>
    </div>

</template>

<script>
import CallState from "../../../wfc/av/engine/callState";
import VideoType from "../../../wfc/av/engine/videoType";
import wfc from "../../../wfc/client/wfc";

export default {
    name: "ConferenceParticipantVideoView",
    props: {
        currentPageParticipants: {
            type: Object,
            required: true
        },
        participant: {
            type: Object,
            required: true
        },
        session: {
            type: Object,
            required: true,
        },
        selfUserInfo: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            status: CallState.STATUS_CONNECTING,
            setupVideoViewTimer: 0,
            selfUserId: wfc.getUserId(),
        }
    },
    created() {
        console.log('videoView created', this.participant);
        if (this.selfUserId !== this.participant.uid) {
            if (!this.participant._isVideoMuted) {
                this.session.setParticipantVideoType(this.participant.uid, this.participant._isScreenSharing, VideoType.BIG_STREAM);
            }
        }
    },
    unmounted() {
        console.log('videoView unmounted', this.participant.uid);
        if (this.selfUserInfo.uid !== this.participant.uid) {
            if (!this.participant._isVideoMuted) {
                this.session.setParticipantVideoType(this.participant.uid, this.participant._isScreenSharing, VideoType.NONE);
            }
        }
    },
    mounted() {
    },
    updated() {
        // re-render
        console.log('view updated, re-setupVideoView')
    },
    methods: {
        // onDbClickVideo() {
        //     if (conferenceManager.isOwner()) {
        //         conferenceManager.requestFocus(this.participant.uid);
        //     } else {
        //         if (conferenceManager.conferenceInfo.focus) {
        //             this.$notify({
        //                 text: '主持人已设置了焦点用户',
        //                 type: 'warn'
        //             });
        //         } else {
        //             conferenceManager.localFocusUser = this.participant;
        //         }
        //     }
        // },

        switchVideoType(userId, screenSharing) {
            if (!this.session) {
                return
            }
            let currentVideoType = VideoType.BIG_STREAM;
            let videoType = VideoType.NONE;
            if (currentVideoType === VideoType.NONE) {
                videoType = VideoType.BIG_STREAM;
            } else if (currentVideoType === VideoType.BIG_STREAM) {
                videoType = VideoType.SMALL_STREAM;
            } else if (currentVideoType === VideoType.SMALL_STREAM) {
                videoType = VideoType.NONE;
            }
            this.session.setParticipantVideoType(userId, screenSharing, videoType);
        },
    },
    computed: {
        userName() {
            let name = '';
            let user = this.participant;
            if (user.groupAlias) {
                name = user.groupAlias;
            } else if (user.friendAlias) {
                name = user.friendAlias;
            } else if (user.displayName) {
                name = user.displayName;
            } else {
                name = user.name;
            }
            return name;
        },
        // FYI: https://stackoverflow.com/questions/62729380/vue-watch-outputs-same-oldvalue-and-newvalue
        isVideoMuted() {
            return this.participant._isAudience || this.participant._isVideoMuted;
        },

        computedParticipantSizeStyle() {
            let width;
            let height;
            if (this.currentPageParticipants.length === 1) {
                width = '750rpx';
                height = '400rpx'
            } else if (this.currentPageParticipants.length <= 4) {
                width = '375rpx';
                height = '375rpx'
            } else {
                width = '250rpx';
                height = '250rpx'
            }
            return {
                width: width,
                height: height,
            }
        }
    },
    watch: {}
}
</script>

<style scoped>

.iconfont {
    font-family: icomoon;
}

.participant-video-item {
    display: flex;
    position: relative;
    width: 200px;
    height: 200px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid black;
    background: #2d3033;
}

.participant-video-item .video {
    width: 200px;
    height: 200px;
}

.participant-video-item.highlight {
    border: 2px solid #1FCA6A;
}

.participant-video-item .video-stream-tip-container {
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
}

.participant-video-item .avatar-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: #2d3033;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50px;
}

.participant-video-item .info-container {
    position: absolute;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: row;
    background: gray;
    border-radius: 1px;
    padding: 5px 10px;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.info-container .name {
    height: 20px;
    line-height: 20px;
    text-align: center;
    font-size: 14px;
    padding-left: 5px;
}

.participant-video-item > video {
    max-width: 200px;
    max-height: 200px;
    width: 200px;
    height: 200px;
    object-fit: cover;
}

.participant-video-item p {
    max-height: 20px;
    color: white;
}

</style>
