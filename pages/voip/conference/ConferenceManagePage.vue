<template>
    <div class="conference-manage-view-container" ref="rootContainer">
        <div class="tip-container" v-if="selfUserId === conferenceManager.conferenceInfo.owner">
            <div v-if="showParticipantList && conferenceManager.applyingUnmuteAudioMembers.length > 0"
                 @click="showParticipantList = false;showAudioApplyList = true"
                 class="action-tip">{{ audioApplyUnmuteTip }}
            </div>
            <div v-if="showAudioApplyList" class="title-container">
                <i class="icon-ion-android-arrow-back"
                   @click="showAudioApplyList = false; showParticipantList = true"
                ></i>
                <p>申请解除静音列表</p>
            </div>
            <div v-if="showParticipantList && conferenceManager.applyingUnmuteVideoMembers.length > 0"
                 @click="showParticipantList = false;showVideoApplyList = true"
                 class="action-tip">{{ videoApplyUnmuteTip }}
            </div>
            <div v-if="showVideoApplyList" class="title-container">
                <i class="icon-ion-android-arrow-back"
                   @click="showVideoApplyList = false; showParticipantList = true"
                ></i>
                <p>申请开启摄像头列表</p>
            </div>
            <div v-if="showParticipantList && conferenceManager.handUpMembers.length > 0"
                 @click="showParticipantList = false; showHandUpList = true"
                 class="action-tip">{{ handUpTip }}
            </div>
            <div v-if="showHandUpList" class="title-container">
                <i class="icon-ion-android-arrow-back"
                   @click="showHandUpList = false; showParticipantList = true"
                ></i>
                <p>举手列表</p>
            </div>
        </div>
        <ConferenceParticipantListView
            v-if="showParticipantList"
            style="flex: 1"
            :participants="participants"
            :session="session"
        />
        <ConferenceApplyUnmuteAudioListView
            style="flex: 1"
            v-if="showAudioApplyList"
        />
        <ConferenceApplyUnmuteVideoListView
            style="flex: 1"
            v-if="showVideoApplyList"
        />
        <ConferenceHandUpListView
            v-if="showHandUpList"
        />
    </div>
</template>

<script>
import wfc from "../../../wfc/client/wfc";
import conferenceManager from "./conferenceManager";
import ConferenceParticipantListView from "./ConferenceParticipantListView";
import ConferenceHandUpListView from "./ConferenceHandUpListView";
import ConferenceApplyUnmuteVideoListView from "./ConferenceApplyUnmuteVideoListView.vue";
import ConferenceApplyUnmuteAudioListView from "./ConferenceApplyUnmuteAudioListView.vue";

export default {
    name: "ConferenceManageView",
    data() {
        return {
            conferenceManager: conferenceManager,
            selfUserId: conferenceManager.selfUserId,
            isContextMenuShow: false,
            currentParticipant: {},
            showParticipantList: true,
            showAudioApplyList: false,
            showVideoApplyList: false,
            showHandUpList: false,
            session: conferenceManager.session,
            conferenceParticipantUpdateTime: new Date().getTime(),
        }
    },
    components: {
        ConferenceHandUpListView,
        ConferenceApplyUnmuteAudioListView,
        ConferenceApplyUnmuteVideoListView,
        ConferenceParticipantListView,
    },
    mounted() {
        wfc.eventEmitter.on('conferenceParticipantUpdated', this.onConferenceParticipantUpdated)
    },
    beforeUnmount() {
        wfc.eventEmitter.removeListener('conferenceParticipantUpdated', this.onConferenceParticipantUpdated);
    },
    methods: {
        onConferenceParticipantUpdated() {
            // trigger participants re-computed
            this.conferenceParticipantUpdateTime = new Date().getTime();
        },
        profile2UserInfo(profile) {
            let userInfo = wfc.getUserInfo(profile.userId);
            userInfo._isAudience = profile.audience;
            userInfo._isHost = this.session.host === profile.userId;
            userInfo._isVideoMuted = profile.videoMuted;
            userInfo._isAudioMuted = profile.audioMuted;
            userInfo._volume = 0;
            userInfo._isScreenSharing = profile.screenSharing;
            return userInfo;
        },
    },
    computed: {
        handUpMembers() {
            return this.conferenceManager.handUpMembers;
        },

        handUpTip() {
            let ids = conferenceManager.handUpMembers;
            let userInfos = wfc.getUserInfos(ids, '');
            let desc = userInfos[0].displayName;
            if (userInfos.length > 1) {
                desc += ' 等'
            }
            desc += '正在举手'
            return desc;
        },
        participants() {
            let participantUserInfos = [];
            let selfProfile = this.session.getSelfProfile();
            let selfUserInfo = this.profile2UserInfo(selfProfile)
            selfUserInfo.__conferenceParticipantUpdateTime = this.conferenceParticipantUpdateTime;
            console.log('selfProfile', selfProfile);
            participantUserInfos.push(selfUserInfo);
            let participantProfiles = this.session.getParticipantProfiles();
            console.log('participantProfiles', participantProfiles)
            for (const p of participantProfiles) {
                let userInfo = this.profile2UserInfo(p);
                participantUserInfos.push(userInfo);
            }
            console.log('participantUserInfos', participantUserInfos)
            return participantUserInfos;
        },

        audioApplyUnmuteTip() {
            let ids = conferenceManager.applyingUnmuteAudioMembers;
            if (ids.length > 0) {
                let userInfos = wfc.getUserInfos(ids, '');
                let desc = userInfos[0].displayName;
                if (userInfos.length > 1) {
                    desc += ' 等'
                }
                desc += '正在申请解除静音'
                return desc;
            } else {
                return '';
            }
        },

        videoApplyUnmuteTip() {
            let ids = conferenceManager.applyingUnmuteVideoMembers;
            if (ids.length > 0) {
                let userInfos = wfc.getUserInfos(ids, '');
                let desc = userInfos[0].displayName;
                if (userInfos.length > 1) {
                    desc += ' 等'
                }
                desc += '正在申请开启摄像头'
                return desc;
            } else {
                return '';
            }
        }

    },
    watch: {},

}
</script>

<style scoped>
.conference-manage-view-container {
    height: 100vh;
    overflow: auto;
    background-color: #ffffffe5;
    backdrop-filter: blur(6px);
    border-left: 1px solid #e6e6e6;
    display: flex;
    flex-direction: column;
}

.conference-manage-view-container.active {
    display: flex;
    flex-direction: column;
}

.conference-manage-view-container .action-tip {
    padding: 10px;
    background: #f1f1f1;
    border-bottom: 1px solid #dadada;
}

.conference-manage-view-container .action-tip:active {
    background: #d6d6d6;
}

.title-container {
    display: flex;
    padding: 10px;
    align-items: center;
    background: #f1f1f1;
}

.title-container i {
    padding-right: 10px;
    height: 100%;
}

.title-container i:active {
    /*background: #d6d6d6;*/
}

</style>
