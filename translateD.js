// ==UserScript==
// @name         沪江小D划词翻译
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  重写沪江小D划词(2018/03/24)
// @author       mixxiu
// @match        *://*/*
// @exclude      *://*.hjenglish.com/*
// @exclude      https://www.hjdict.com/*
// @connect      *
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';



    // px
    let WIDTH = 280
    let COLOR = '#e0783e'//'#4ca856'//'#7373f3'//'#e0783e'
    let headCOLOR = function () {
        let s = 24
        let r = Number(Number('0x' + COLOR.slice(1, 3)).toString(10)) - s
        let g = Number(Number('0x' + COLOR.slice(3, 5)).toString(10)) - s
        let b = Number(Number('0x' + COLOR.slice(5, 7)).toString(10)) - s

        return '#' + r.toString(16) + g.toString(16) + b.toString(16)
    }

    let translateDCSSContent = ''
        + '#translateD a {text-decoration: none;}'
        + '#translateD h1{font-size:26px;}'
        + '#translateD h2{font-size:19.5px;margin:10.70px 0px;}'
        + '#translateD h3{font-size:18px}'
        + '#translateD h4{font-size:17.29px;}'
        + '#translateD h5{font-size:10.79px;}'
        + '#translateD h6{font-size:8.71px;}'
        + '#translateD h1,#translateD h2{font-weight:bold;}'
        + '#translateD p{margin:13px 0px;}'
        + '#translateD h1,#translateD h2,#translateD h3,#translateD h4,#translateD h5,#translateD h6{margin-top:0;}'
        + '#translateD li{ list-style:none;}'
        + '#translateD dl{margin:13px 0px;}'
        + '#translateD dd{ margin-left:6px;}'
        + '#translateD dd ul{ margin-left:6px;padding-right: 6px;}'
        + '#translateD {overflow:hidden;text-align:left;font-family:"Microsoft YaHei",Arial, Helvetica, sans-serif;z-index:99999;position:fixed;width:' + WIDTH + 'px;height:96vh;top:1.8vh;right:-' + (WIDTH + 20) + 'px;border-radius:5px;background-color:white;opacity:0.96;box-shadow:0px 0px 30px #00000047;transition:right 0.32s,opacity 0.3s;}'
        + '#translateD .translateD-content{padding:0;border:0;}'
        // 分类
        + '.word-nav {margin-top:0;position:absolute;font-size:14px;padding-left:1px;min-width:' + WIDTH + 'px;height:34px;align-items:center;background-color:white;display:flex;list-style:none;border-top:1px solid #efefef;border-bottom:1px solid #efefef;margin-left:0px;transition:margin-left 0.4s;}'
        + '.word-nav li {padding-left:12px;width:62px;}'
        + '.word-nav a {color:black;}'
        + '.redirection {color:#ffffffd9;border-radius:4px;padding:12px;background-color:#00000014;}'
        + '.word-details-pane-header {padding:1.8vh;background-color:' + COLOR + ';color:white;}'
        + '#word-details-pane-content-all {overflow-y:hidden;}'
        + '.word-details-pane-content {font-size:12px;padding:12px;padding-top:6px;transition:margin-top 0.2s;}'
        + '.word-details-pane-content > div:nth-child(n+2) {display:none;}'
        + '.word-details-pane:nth-child(n+2) {display:none;}'
        + '.word-details-pane-content-all{overflow:hidden;}'
        + '.word-nav-point {display:block;position:absolute;width:62px;height:2px;background-color:' + COLOR + ';transition:margin-left 0.4s;margin-top:34px;}'
        // 来源词典与分级去除
        + '.detail-source {display:none;}'
        + '.collins-icon {padding:2px;background-color:#e84b4b;color:white;}'
        + '.wys-icon,.wjs-icon {padding:2px;background-color:' + COLOR + ';color:white;}'
        + '.detail-tags-en {display:none;}'
        + '.detail-tags-en li {padding:2px 4px;background-color:#f1f1f1;list-style:none;margin-right:4px;}'
        + '.def-sentence-from {margin-bottom:4px;}'
        + '.def-sentence-to {margin-top:0px;color:#8a8a8a;}'
        + '.detail-groups > dl {border-bottom:1px solid #f1f1f1;}'
        + '.detail-groups > dl dt,.enen-groups >dl dt,.analyzes-title {overflow-wrap: break-word;color:' + COLOR + '; padding:2px 6px 4px 6px;font-size:16px;border-radius:4px; background-color:#f8f8f8;border:1px solid #e6e6e6;}'
        + '.detail-groups > dl dt span.detail-pron {color:#b5b5b5;}'
        + '.enen-groups >dl > dd {font-size:14px;;margin-top:10px;margin-bottom:10px;}'
        // counter CSS计数器，给无序tag增加序列
        + '.detail-groups h3 {font-size:14px!important;color:' + COLOR + '}'
        + '.detail-groups dl dd h3:before {display:inline;width:22px;}'
        + '.detail-groups dl > dd:nth-child(1) > p {color:red;}'
        + '.phrase-items li {margin-bottom:10px;}'
        + '.phrase-items span:nth-child(1),.phrase-items a  {font-size:14px;color:' + COLOR + ';display:block;}'
        + '.syn table,.ant table{background-color:#f8f8f8;border:1px solid #e6e6e6;border-radius:4px;border-spacing:0px;}'
        + '.syn tr:nth-child(2n),.ant tr:nth-child(2n) {background-color:white;}'
        + '.syn tr td,.ant tr td {padding:6px;width:' + (WIDTH - 24) / 2 + 'px; cursor:pointer;transition:background-color 0.2s,color 0.2s;}'
        + '.syn tr td:hover,.ant tr td:hover {background-color:' + COLOR + ';}'
        + '.syn tr td a,.ant tr td a {color:black;transition:color 0.2s;}'
        + '.syn tr td:hover a,.ant tr td:hover a {color:white!important;}'
        + '.syn tr > td:nth-child(1),.ant tr > td:nth-child(1) {border-right:1px solid #e6e6e6;}'
        + '.analyzes-items li a {font-size:14px;color:' + COLOR + '}'
        + '.inflections-items {font-size:14px;padding:10px 0px;}'
        + '.inflections-items li {margin-bottom:16px;}'
        + '.inflections-item-attr {padding:4px;background-color:' + COLOR + ';color:white;border-radius:4px 0px 0px 4px;}'
        + '.inflections-items a {padding:4px 8px;background-color:#f8f8f8;color:black;border-radius:0px 4px 4px 0px;}'

        + '.synant-content{user-select:none;}'
        + '.simple-definition a{display:inline-block;margin-top:10px;margin-right:2px;cursor:pointer;text-decoration:none;color:white;padding:4px 8px;border:1px solid #ffffff14;border-radius:4px;background-color:#ffffff24;transition:background-color 0.2s;}'
        + '.simple-definition a:hover{background-color:#ffffff63;}'

        + '.word-details-header{background-color:' + headCOLOR() + ';}'
        + '.word-details-header p{margin-top:0px!important;display:none;}'
        + '.word-details-header p > span {}'
        + '.word-details-header ul{display:flex;}'
        + '.word-details-header ul li{width:0px;display:inherit;justify-content:center;padding:6px 0px 8px 0px;transition:width 0.2s;}'
        + '.word-details-header ul li h2{display:none;}'
        + '.word-details-header ul li div.pronounces{font-weight:lighter;color: #ffffff87}'
        + '.word-details-header ul li:nth-child(1) div.pronounces{color: white}'
        + '.word-details-header span.word-header-triangle{position:absolute;width:0;height:0;margin-top:-6px;margin-left:0px;;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:6px solid ' + COLOR + ';transition:margin-left 0.4s;}'

        + '.word-notfound-inner {background-color:' + COLOR + ';color:white;display: flex;height:10vh;align-items: center;}'
        + '.word-notfound-inner span{font-size: 16px;}'

        + '@keyframes search-bar{from{transform:scale3d(0,0,0)}to{transform:scale3d(1,1,1)}}'
        + '#translateD-search-bar{width:22px;height:22px;z-index: 99999;position: absolute;border-radius:30px;background-color:' + COLOR + ';opacity:0.84;box-shadow:0px 0px 10px '+COLOR+'54;display:none;top:0;left:0;animation-name:search-bar;animation-duration:0.24s;}'




    /**
    * 返回height的int数值
    * @param {*} CSSSelector
    * @param type 'object'
    */
    function getElementHeight(CSSSelector, type) {
        switch (type) {
            case 'object':
                return parseInt(getComputedStyle(CSSSelector, null).height.replace(/px/, ''))
                break;
            default:
                return parseInt(getComputedStyle($(CSSSelector), null).height.replace(/px/, ''))
                break;
        }
    }

    /**
     * document.querySelector
     * @param {String} CSSSelector 
     */
    function $(CSSSelector) {
        return document.querySelector(CSSSelector)
    }
    /**
     * document.querySelectorAll
     * @param {String} CSSSelector 
     */
    function $All(CSSSelector) {
        return document.querySelectorAll(CSSSelector)
    }

    //'<div class="">'+searchSVG+'</div>'

    window.onload = () => {
        let style = document.createElement("style")
        let div = document.createElement("div")
        let bar = document.createElement("div")
        style.id = 'translateDCSS'
        div.id = 'translateD'
        bar.id = 'translateD-search-bar'
        $('head').appendChild(style)
        document.body.appendChild(div)
        document.body.appendChild(bar)

        let searchSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" style = "width:22px;display:fixed;"><defs><style>.cls-1,.cls-4{fill:none;}.cls-2{opacity:0.35;}.cls-31{fill:none;}.cls-4{stroke:#fff;stroke-miterlimit:10;stroke-width:2px;opacity:0.88;isolation:isolate;}</style></defs><title></title><g id="图层_2" data-name="图层 2"><g id="图层_1-2" data-name="图层 1"><g id="图层_2-2" data-name="图层 2"><g id="图层_3" data-name="图层 3"><rect class="cls-1" width="20" height="20"/><g class="cls-2"><circle class="cls-31" cx="10" cy="10" r="8"/></g><path class="cls-4" d="M9.48,13.69H7.4l.72-7H10.2A2.75,2.75,0,0,1,13,9.39a1.79,1.79,0,0,1,0,.4l-.08.78A3.56,3.56,0,0,1,9.48,13.69Z"/></g></g></g></g></svg>'

        style.innerHTML += translateDCSSContent
        bar.innerHTML += searchSVG
    }



    
    let CJK = /[\u3400-\u4DB5\u2000-\u2A6F\u4E00-\u9FA5]/gm
    let JP = /[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/gm
    let US = /[A-Za-z]/gm
    let other = /\s.+/


    document.body.addEventListener('mouseup', event => {
        let selectedText = window.getSelection().toString()
        let searchBar = $('#translateD-search-bar')
        let doSearch = function () {
            switch (true) {
                case JP.test(selectedText) || CJK.test(selectedText)://
                    foo(selectedText, jc)
                    break;
                case US.test(selectedText):
                    foo(selectedText, en)
                    break;
            }
            searchBar.removeEventListener('click', doSearch, false)
            searchBar.style.display = ''
        }

        if (selectedText!=='' && window.getSelection().focusNode.tagName == undefined) {
            searchBar.style = 'margin-top:' + (parseInt(event.pageY) + 15) + 'px;margin-left:' + (parseInt(event.pageX) + 15) + 'px'
            searchBar.style.display = 'block'
        }else{
            $('#translateD').style.right = ''
            searchBar.style.display = ''
        }

        searchBar.addEventListener('click', doSearch, false)

        // foo(selectedText,cj)

        console.log(selectedText)
        console.log(window.getSelection().focusNode.tagName)
    }, false)



   


    let en = 'https://dict.hjenglish.com/w/'
    let cj = 'https://dict.hjenglish.com/jp/cj/'
    let jc = 'https://dict.hjenglish.com/jp/jc/'

    // DOM 操作
    function foo(word, type) {
        let url = type + encodeURI(word)
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onprogress: () => { console.log('progress') },
            onload: function (response) {
                let result_1 = '', result_2 = '', result_3 = '';

                result_1 = response.responseText
                    .replace(/\r\n/g, '')
                    .replace(/\n/g, '')

                result_2 = result_1
                    .replace(/<aside class="side">.+<\/aside>/gm, '')
                    .match(/<section class="content">.+<\/section>/gm)[0]
                    .replace(/<script type="text\/javascript">.+<\/script>/gm, '')
                    .replace(/<div class="word-details-ads-placeholder"><\/div>/gm, '<div id="word-nav">' + result_1.match(/<ul class="word-nav">.+?<\/ul>/gm) + '<span class="word-nav-point" data-point = "1" style="margin-left:10px;"></span></div>')
                    .replace(/<ul class="word-nav">.+?<\/ul>/, '')
                    .replace(/<ul class="word-nav">/, '<ul class="word-nav" style="margin-left:0px;">')
                    .replace(/<div class="word-details-ads">.+?<\/div>\s.<\/div>/gm, '')
                    .replace(/<div class="word-details-pane-content"/gm, '<div class="word-details-pane-content" style="margin-top:36px";')
                    .replace(/(<h2>网络热点<\/h2>)|(<h2>详细释义<\/h2>)|(<h2>常用短语<\/h2>)|(<h2>英英释义<\/h2>)|(<h2>词形变化<\/h2>)|(<h2>同反义词<\/h2>)|(<h2>词义辨析<\/h2>)/gm, '')
                    .replace(/<a\shref="\/w\//gm, '<a data-syn-word="')
                    .replace(/http:\/\//gm, 'https://')
                    .replace(/class="content"/g, 'class="translateD-content"')

                // 多音字
                let m = /<div class="word-details-pane-content".+?<\/footer>/gm
                let result_cache = []
                let wordDetailsPaneContent = function () {
                    result_2.match(m).forEach(e => {
                        result_cache.push(e)
                        result_2 = result_2.replace(m, '<%-wordDetailsPaneContent-%>')
                    })
                    result_cache.forEach(e => {
                        result_2 = result_2.replace(/<%-wordDetailsPaneContent-%>/m, '<div class="word-details-pane-content-all">' + e + '</div>')
                    })

                }

                if (new RegExp(m, 'gm').test(result_2)) {
                    wordDetailsPaneContent()
                }

                let h = /<header class="word-details-header">.+?<\/header>/gm
                if (h.test(result_2)) {
                    result_2 = result_2.replace(h, result_2.match(h)[0].replace(/\[|\]/gm, '').replace(/<\/header>/, '<span class="word-header-triangle"></span></header>'))
                }


                let iconSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" style="width: 44px;margin:0px 16px 0px 12px;"><defs><style>.cls-1{opacity:0.35;}.cls-2{fill:#2d2d2d;}.cls-3{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:4px;opacity:1;}</style></defs><title>资源 1</title><g id="图层_2" data-name="图层 2"><g id="图层_3" data-name="图层 3"><g class="cls-1"><circle class="cls-2" cx="22" cy="22" r="22"/></g><path class="cls-3" d="M20.56,32.14H14.84l2-19.28h5.71a7.6,7.6,0,0,1,7.68,8.57L30,23.57A9.78,9.78,0,0,1,20.56,32.14Z"/></g></g></svg>'

                $('#translateD').innerHTML = result_2
                    .replace(/<footer class="word-details-pane-footer">.+?<\/footer>/gm, '')
                    .replace(/<section class="word-details-content"/gm, '<section class="word-details-content" data-active-pane=0')
                    .replace(/<div class="word-notfound-inner">.+?<\/div>|<div class="word-suggestions">.+?<\/div>/gm, '<div class="word-notfound-inner">' + iconSVG + '<span>没有找到你查的单词结果</span></div>')



                //0 event 'wheel' can used in chrome&firefox
                let stopScroll = function (event) {
                    event.preventDefault()
                }
                $('#translateD').addEventListener('mouseenter', e => {
                    $('html').addEventListener('wheel', stopScroll, false)

                    $('#translateD').addEventListener('mouseleave', e => {
                        $('html').removeEventListener('wheel', stopScroll, false)
                    })
                })



                // 1 切换内容tag
                // for content tag
                let data_point = 1
                let wordNav = function () {

                    let watchWheel = function (event) {
                        // up
                        if (event.deltaY < 0) {
                            wordNavTagSwitch('up')
                        }
                        //down
                        else if (event.deltaY > 0) {
                            wordNavTagSwitch('down')
                        }
                    }

                    // display tag
                    let wordDetilShow = function () {
                        let divSelectorPath = '.word-details-pane-content > div:nth-child(' + data_point + ')'
                        $All('.word-details-pane-content > div').forEach(e => {
                            e.style.display = 'none'
                        })
                        $(divSelectorPath).style.display = 'block'
                        $('.word-details-pane-content').style.marginTop = '36px'
                    }

                    // switch nav
                    let wordNavTagSwitch = function (type) {
                        const nav = $('.word-nav')
                        const navPoint = $('.word-nav-point')
                        const navLiNum = (nav.childNodes.length - 1) / 2

                        const navlength = parseInt(WIDTH / 74)

                        let navScroll = function () {
                            navPoint.setAttribute('data-point', data_point)
                            if (data_point <= navlength) {
                                navPoint.style.marginLeft = (data_point * 74) - 64 + 'px'
                                nav.style.marginLeft = '0px'
                            }
                            else if (data_point > navlength) {
                                navPoint.style.marginLeft = WIDTH - 74 + 'px'
                                // 
                                const navMarginLeft = - (((data_point * 74) - WIDTH) + 10) + 'px'
                                nav.style.marginLeft = navMarginLeft
                            }
                        }


                        if (type == 'up' && data_point > 1) {
                            data_point--
                            navScroll()
                            wordDetilShow()

                        }
                        else if (type == 'down' && data_point < navLiNum) {
                            data_point++
                            navScroll()
                            wordDetilShow()

                        }
                    }


                    $('#word-nav').addEventListener('mouseenter', e => {
                        // add Listener
                        $('#word-nav').addEventListener('wheel', watchWheel, false)
                    })
                    $('#word-nav').addEventListener('mouseleave', e => {
                        // remove Listener
                        $('#word-nav').removeEventListener('wheel', watchWheel, false)
                    })
                }


                // 2 内容滚动
                let wordDetail = function () {
                    // 2.content detail
                    const wordPaneAll = $All('.word-details-pane-content-all')
                    const wordPaneContent = $All('.word-details-pane-content')
                    const wordDetailsPaneHeaderAll = $All('.word-details-pane-header')
                    const wordNavAll = $All('.word-nav')
                    const wordDetailsPaneContentAll = $All('.word-details-pane-content')


                    let translateDHeight = getElementHeight('#translateD')
                    let wordTagHeight, headerHeight, wordNavHeight, wordDetailsPaneContentHeight, contentHeightMarginTop, data_active_pane;
                    wordNavHeight = 0;// defult

                    let scrollContent = function (event) {
                        // 1 get wordNavHeight
                        data_active_pane = $('.word-details-content').getAttribute('data-active-pane')

                        if ($All('.word-details-tab').length !== 0) {
                            wordNavHeight = getElementHeight('.word-details-tab')
                        }

                        // 2
                        headerHeight = getElementHeight(wordDetailsPaneHeaderAll[data_active_pane], 'object')
                        wordNavHeight = getElementHeight(wordNavAll[data_active_pane], 'object')
                        wordDetailsPaneContentHeight = getElementHeight(wordDetailsPaneContentAll[data_active_pane], 'object')

                        contentHeightMarginTop = translateDHeight - headerHeight - wordNavHeight - wordDetailsPaneContentHeight

                        const scrollDistance = 120
                        let wordDetailsPaneContentMarginTop
                        if (contentHeightMarginTop < 0) {
                            wordDetailsPaneContentMarginTop = parseInt(getComputedStyle(wordDetailsPaneContentAll[data_active_pane], null).marginTop.replace(/px/, ''))
                            if (event.deltaY < 0) {
                                wordDetailsPaneContentMarginTop + scrollDistance < 36 ?
                                    wordDetailsPaneContentAll[data_active_pane].style.marginTop = wordDetailsPaneContentMarginTop + scrollDistance + 'px'
                                    :
                                    wordDetailsPaneContentAll[data_active_pane].style.marginTop = '36px'

                            }
                            else if (event.deltaY > 0) {
                                wordDetailsPaneContentMarginTop - scrollDistance > contentHeightMarginTop ?
                                    wordDetailsPaneContentAll[data_active_pane].style.marginTop = wordDetailsPaneContentMarginTop - scrollDistance + 'px'
                                    :
                                    wordDetailsPaneContentAll[data_active_pane].style.marginTop = contentHeightMarginTop + 'px'

                            }
                        }
                    }


                    for (let i = 0; i < wordPaneAll.length; i++) {
                        wordPaneAll[i].addEventListener('mouseenter', event => {
                            wordPaneAll[i].addEventListener('wheel', scrollContent, false)
                        })
                        wordPaneAll[i].addEventListener('mouseleave', event => {
                            wordPaneAll[i].removeEventListener('wheel', scrollContent, false)
                        })
                    }
                }



                // 3 同反义词跳转
                let wordSyn = function () {
                    let aTag = function (event) {
                        if (event.target.tagName == 'A') {
                            foo(event.target.getAttribute('data-syn-word'), en)
                        } else if (event.target.tagName == 'TD') {
                            foo(event.target.childNodes[1].getAttribute('data-syn-word'), en)
                        }
                    }
                    if ($All('.syn').length !== 0) {
                        $('.syn').addEventListener('click',aTag,false)
                    }
                    let simple_definition = $All('.simple-definition')
                    if (simple_definition.length !== 0) {
                        simple_definition.forEach(e => {
                            e.addEventListener('click',aTag,false)
                        })
                    }
                }



                // 4 多个读音选择
                let multiPronunciation = function () {
                    if ($All('.word-details-header').length !== 0) {
                        let li = $All('.word-details-tab')
                        let span = $('.word-header-triangle')
                        let liWidth = WIDTH / $All('.word-details-tab').length
                        // 3 is span width/2
                        span.style.marginLeft = (liWidth / 2 - 3) + 'px'

                        let contentAll = $All('.word-details-pane')
                        let data_active
                        let headerDone = function (event) {
                            if (event.target.tagName == 'LI') {
                                data_active = event.target.getAttribute('data-active')
                                span.style.marginLeft = (liWidth / 2 - 3) + liWidth * data_active + 'px'
                                contentAll.forEach(e => {
                                    e.style.display = 'none'
                                })
                                contentAll[data_active].style.display = 'block'
                                $All('.pronounces').forEach(e => {
                                    e.style.color = '#ffffff87'
                                })
                                event.target.childNodes[3].style.color = 'white'
                                $('.word-details-content').setAttribute('data-active-pane', data_active)
                            }
                        }

                        for (let i = 0; i < li.length; i++) {
                            li[i].style.width = liWidth + 'px'
                            li[i].setAttribute('data-active', i)
                            li[i].addEventListener('mouseenter', headerDone, false)
                        }
                    }
                }



                // run function
                if ($All('.word-notfound-inner').length !== 0) {
                    $('#translateD').style.height = '64px'

                    setTimeout(() => {
                        $('#translateD').style.opacity = '0'
                        setTimeout(() => {
                            $('#translateD').style.right = ''
                            setTimeout(() => {
                                $('#translateD').style.opacity = '1'
                            }, 300)
                        }, 300)
                    }, 1000);

                } else {
                    $('#translateD').style.opacity = ''
                    $('#translateD').style.height = ''

                    if ($All('.word-nav').length !== 0) {
                        wordNav()
                        wordDetail()
                        wordSyn()
                        multiPronunciation()

                        if ($('.word-nav').children.length < 1 && $('.word-details-pane-content').children.length < 1) {
                            $('#translateD').style.height = getElementHeight('.word-details-pane-header') + 13 + 'px'
                        }
                    }
                }


                // 6
                $('#translateD').style.right = '1.8vh'
            }
        })
    }

})()