import {
  formatTime
} from './formatTime.js'
class PlayList {
  constructor({
    commentCount,
    commentThreadId,
    picUrl,
    createTime,
    creatorId,
    creatorName,
    creatorPicUrl,
    description,
    id,
    name,
    playCount,
    shareCount,
    subscribedCount,
    tags,
    songIds
  }) {
    this.commentCount = commentCount
    this.commentThreadId = commentThreadId
    this.picUrl = picUrl
    this.createTime = createTime
    this.creatorId = creatorId
    this.creatorName = creatorName
    this.creatorPicUrl = creatorPicUrl
    this.description = description
    this.id = id
    this.name = name
    this.playCount = playCount
    this.shareCount = shareCount
    this.subscribedCount = subscribedCount
    this.tags = tags
    this.songIds = songIds
  }
}

export function playListDetailForRank(playList) {
  return new PlayList({
    commentCount: playList.commentCount,
    commentThreadId: playList.commentThreadId,
    picUrl: playList.coverImgUrl,
    createTime: formatTime(playList.createTime),
    creatorId: playList.userId,
    creatorName: playList.creator.nickname,
    creatorPicUrl: playList.creator.avatarUrl,
    description: playList.description,
    id: playList.id,
    name: playList.name,
    playCount: playList.playCount,
    shareCount: playList.shareCount,
    subscribedCount: playList.subscribedCount,
    tags: playList.tags,
    songIds: handleSongIds(playList.tracks)
  })
}

function handleSongIds(ids) {
  let ret = []

  ids.forEach((item) => {
    ret.push({
      id: item.id,
      name: item.name,
      singer: {
        id: item.artists[0].id,
        name: item.artists[0].name
      },
      album: {
        id: item.album.id,
        name: item.album.name,
        picUrl: item.album.picUrl
      },
      duration: item.duration / 1000,
      ifHighQuality: item.hMusic ? true : false
    })
  })

  return ret
}