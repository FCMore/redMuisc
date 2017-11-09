import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import BigTitle from '../../components/bigTitle/index.jsx'
import RecommendTitle from '../../components/recommendTitle/index.jsx'
import TitleColumn from '../../components/titleColumn/index.jsx'
import PlayList from './playList/index.jsx'
import Album from './album/index.jsx'
import SongInformation from './songInfo/index.jsx'
import SingerSelf from './singerSelf/index.jsx'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {mapState} from '../../store/reducers/mapState.js'
import * as searchHistoryActions from '../../store/actions/saveSearchHistory.js'
import {getKeySong,search,multiSearch} from '../../api/search.js'
import {debunce} from '../../common/js/util.js'

import './style.styl'
import './icon.styl'

class Search extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
        this.state = {
          hotKey: [],
          searchContent: '',
          initDone: false,
          singerSongs: [],
          songsCount: 0,
          singerAlbums: [],
          albumCount: 0,
          singerSelf: [],
          singerCount: 0,
          playList: [],
          playListCount: 0,
          currentResult: 'song'
        }
    }
    componentWillMount() {
      this.singerSongsOffset = 0
      this.singerAlbums = 0
      this.singerSelf = 0
      this.singerPlaylist = 0
    }
    componentDidMount() {
      this._initHotSongs()
    }
    _initHotSongs() {
      getKeySong().then((res) =>{
        if(res.code === 0) {
          this.setState({
            hotkey: res.data.hotkey.slice(0,10),
            initDone: true
          })
        }
      })
    }
    hotKeyClick(key) {
      this.setState({
        searchContent: key
      })
    }
    //监听搜索框的内容变化，并将内容记录在state中
    inputChange(e) {
      debunce(this.setState({
        searchContent: e.target.value
      }),400)
    }
    //按下enter键,开始进行搜索,并将搜索框中的内容通过redux放入搜索记录
    enterInput(e) {
      if(e.keyCode === 13) {
        debunce(this.props.saveSearchHistory(this.state.searchContent),800)
      }
      this._search(this.state.searchContent,20,0,1)
    }
    //开始搜索
    _search(keyword,limit,offset,type) {
      search(keyword,limit,offset,type).then((res) =>{
        if(res.code === 200) {
          switch(type) {
            case 1: 
              let songs = []
              let songsCount = 0
              res.result.songs.map((item) =>{
                songs.push({
                  songId: item.id,
                  songName:item.name,
                  singerId: item.artists[0].id,
                  singerName: item.artists[0].name,
                  albumId: item.album.id,
                  albumName: item.album.name
                })
              })
              songsCount = res.result.songCount
              this.setState({
                singerSongs: songs,
                songsCount: songsCount,
                initDone: true
              })
              break

            case 10:
              let albums = []
              let albumCount = 0
              res.result.albums.map((item) =>{
                albums.push({
                  albumId: item.id,
                  albumName: item.name,
                  picUrl: item.picUrl,
                  singerId: item.artists[0].id,
                  singerName: item.artists[0].name
                })
              })
              albumCount = res.result.albumCount
              this.setState({
                singerAlbums: albums,
                albumCount: albumCount,
                initDone: true
              })
              break

            case 100:
              let singerSelf = []
              let singerCount = 0
              res.result.artists.map((item) =>{
                singerSelf.push({
                  singeId: item.id,
                  singerName: item.name,
                  picUrl: item.picUrl,
                  alia: item.alias[0]
                }) 
              })
              singerCount = res.result.artistCount
              this.setState({
                singerSelf: singerSelf,
                singerCount: singerCount,
                initDone: true
              })
              break

            case 1000:
              let playList = []
              let playListCount = 0
              res.result.playlists.map((item) =>{
                playList.push({
                  playListId: item.id,
                  playListName: item.name,
                  playListCreatorId: item.creator.userId,
                  playListCreatorName: item.creator.nickname,
                  playCount: item.playCount
                })
              })
              playListCount = res.result.playlistCount
              this.setState({
                playList: playList,
                playListCount: playListCount,
                initDone: true
              })
              break

            default:
              retrun 
          }
        }  
      })
    }
    //点击搜索记录,将该搜索记录重新放入搜索框中并进行搜索，此时并不需要按下enter键和点击搜索符号即可进行搜索
    searchHistoryClick(item) {
      this.setState({
        searchContent: item
      })
    }
    //点击搜索历史右上角的垃圾桶符号,清空搜索历史中的内容
    deleteAllSearchHis() {
      //如果redux中searchHistory为空,直接返回
      if(this.props.searchHistory.length === 0) {
        return 
      }
      this.props.deleteAllHistory()
    }
    //点击搜索历史列表中每个记录的叉号,将该记录从搜索历史中的删除
    deleteSearchHisItem(item,e) {
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      this.props.deleteHistory(item)
    }
    //点击搜索框中的叉号,清空搜索框中的输入内容
    deleteSearchBoxContent() {
      this.setState({
        searchContent: ''
      })
    }
    //对搜索结果进行分类,切换至特定的类型的内容(单曲,专辑,歌手,歌单)
    navClick(item) {
      switch(item) {
        case '单曲' :
          this.setState({
            currentResult: 'song'
          })
          if(this.state.singerSongs.length === 0) {
            this._search(this.state.searchContent,20,0,1)
          }
          break
        
        case '专辑':
          this.setState({
            currentResult: 'album'
          })
          if(this.state.singerAlbums.length === 0) {
            this._search(this.state.searchContent,20,0,10)
          }
          break

        case '歌手':
          this.setState({
            currentResult: 'singer'
          })
          if(this.state.singerSelf.length === 0) {
            this._search(this.state.searchContent,20,0,100)
          }
          break

        case '歌单':
          this.setState({
            currentResult: 'playList'
          })
          if(this.state.playList.length === 0) {
            this._search(this.state.searchContent,20,0,1000)
          }
          break

        default:
          return
      }
    }
    render() {
        return (
            <div className="search-wrapper">
              <BigTitle title={'搜索'}/>
              <div className="search-top-wrapper">
                <div className="search-top">
                  <input className="search-top-input" 
                      placeholder="搜索音乐,歌手,用户,歌词" 
                      onChange={this.inputChange.bind(this)} 
                      onKeyUp={this.enterInput.bind(this)}
                      value={this.state.searchContent}/>
                  <span className="icon-delete search-icon-clear" 
                        style={{display: this.state.searchContent.length > 0 ? '' : 'none'}}
                        onClick={this.deleteSearchBoxContent.bind(this)}></span>
                  <span className="icon-search search-top-icon"></span>
                </div>
              </div>
              <div className="search-hot-and-history" style={{display: this.state.searchContent.length === 0 ? '' : 'none'}}>
                <div className="search-hot">
                  <RecommendTitle title={'热门搜索'} noMore={'no'} />
                  <div className="search-hot-songs">
                    {
                      this.state.initDone
                      ?
                      this.state.hotkey.map((item,index) =>{
                        return <span className="search-hot-songs-item" key={index} onClick={this.hotKeyClick.bind(this,item.k)}>
                                  {item.k}
                                </span>
                      })
                      :
                      'loading...'
                    }
                  </div>
                </div>
                <div className="search-history">
                  <div className="search-history-title-wrapper">
                    <div className="search-history-title-wrapper-left">
                      <span className="search-history-title-wrapper-left-text">搜索历史</span>
                    </div>
                    <div className="search-history-title-wrapper-right" onClick={this.deleteAllSearchHis.bind(this)}>
                      <i className="icon-delete-all search-history-title-wrapper-right-icon"></i>
                    </div>
                  </div>
                  <div className="search-history-content">
                    {
                      this.props.searchHistory.length === 0
                      ?
                      <p className="search-history-content-item">暂无搜索记录</p>
                      :
                      this.props.searchHistory.map((item,index) =>{
                        return <p key={index} className="search-history-content-item" 
                                  onClick={this.searchHistoryClick.bind(this,item)}>
                                    {item}
                                    <span className="icon-delete delete-item" 
                                        onClick={this.deleteSearchHisItem.bind(this,item)}></span>
                                </p>
                      })
                    }
                  </div>
                </div>
              </div>
              <div className="search-result-wrapper" style={{display: this.state.searchContent.length === 0 ? 'none' : ''}}>
                <TitleColumn titles={['单曲','歌手','专辑','歌单']} columnClick={this.navClick.bind(this)}/>
                <div className="search-result">
                  <div className="search-result-scroll">
                    <div style={{
                                  display: this.state.currentResult === 'song' ? '' : 'none'
                                }}>
                      {
                        this.state.initDone
                        ?
                        this.state.singerSongs.map((item,index) =>{
                          return <SongInformation song={item} key={index} songIndex={index}/>
                        })
                        : 
                        <p>loading songs...</p>
                      }
                    </div>
                    <div style={{
                                  display: this.state.currentResult === 'singer' ? '' : 'none'
                                }}>
                      {
                        this.state.initDone
                        ?
                        this.state.singerSelf.map((item,index) =>{
                          return <SingerSelf singer={item} key={index}/>
                        })
                        :
                        <p>loading...singer</p>
                      }
                    </div>
                    <div style={{
                                  display: this.state.currentResult === 'album' ? '' : 'none'
                                }}>
                      {
                        this.state.initDone
                        ?
                        this.state.singerAlbums.map((item,index) =>{
                          return <Album album={item} key={index} albumIndex={index}/>
                        })
                        :
                        <p>loading...album</p>
                      }
                    </div>
                    <div style={{
                                  display: this.state.currentResult === 'playList' ? '' : 'none'
                                }}>
                      {
                        this.state.initDone
                        ?
                        this.state.playList.map((item,index) =>{
                          return <PlayList playList={item} key={index}/>
                        })
                        :
                        <p>loading...playList</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )
    }
}

function bindAction(dispatch) {
  return bindActionCreators(searchHistoryActions,dispatch)
}

export default connect(mapState,bindAction)(Search)