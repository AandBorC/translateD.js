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

    let en = 'https://dict.hjenglish.com/w/'
    let cj = 'https://dict.hjenglish.com/jp/cj/'
    let jc = 'https://dict.hjenglish.com/jp/jc/'

    // px
    let WIDTH = '280'
    let COLOR = '#7373f3'

    let translateDCSSContent = ''
        + '#translateD h1,#translateD h2,#translateD h3,#translateD h4,#translateD h5,#translateD h6{margin-top:0;}'
        + '#translateD li{ list-style:none;}'
        + '#translateD dd{ margin-left:6px;}'
        + '#translateD dd ul{ margin-left:6px;padding-right: 6px;}'
        + '#translateD {overflow:hidden;text-align:left;font-family:"Microsoft YaHei",Arial, Helvetica, sans-serif;z-index:99999;position:fixed;width:' + WIDTH + 'px;height:96vh;top:1.8vh;right:1.8vh;border-radius:4px;border:1px solid #7575cc;background-color:white;opacity:0.96;box-shadow:0px 0px 30px #00000047;}'
        + '#translateD .content{padding:0;border:0;}'
        // 分类
        + '.word-nav{position:absolute;font-size:14px;padding-left:1px;min-width:' + WIDTH + 'px;height:34px;align-items:center;background-color:white;display:flex;list-style:none;border-top:1px solid #efefef;border-bottom:1px solid #efefef;margin-left:0px;transition:margin-left 0.4s;}'
        + '.word-nav li{padding-left:12px;width:62px;}'
        + '.redirection{color:#ffffffd9;border-radius:4px;padding:12px;background-color:#00000014;}'
        + '.word-details-pane-header{padding:1.8vh;border-top-left-radius:2px;border-top-right-radius:2px;background-color:' + COLOR + ';color:white;}'
        + '#word-details-pane-content{overflow-y:hidden;}'
        + '.word-details-pane-content{font-size:12px;padding:12px;padding-top:6px;transition:margin-top 0.2s;}'
        + '.word-details-pane-content > div:nth-child(n+2) {display:none;}'
        + '.word-nav-point{display:block;position:absolute;width:62px;height:2px;background-color:' + COLOR + ';transition:margin-left 0.4s;margin-top:34px;}'
        // 来源词典与分级去除
        + '.detail-source{display:none;}'
        + '.collins-icon {padding:2px;background-color:#e84b4b;color:white;}'
        + '.wys-icon,.wjs-icon{padding:2px;background-color:' + COLOR + ';color:white;}'
        + '.detail-tags-en{display:none;}'
        + '.detail-tags-en li{padding:2px 4px;background-color:#f1f1f1;list-style:none;margin-right:4px;}'
        + '.def-sentence-from{margin-bottom:4px;}'
        + '.def-sentence-to{margin-top:0px;color:#8a8a8a;}'
        + '.detail-groups > dl{border-bottom:1px solid #f1f1f1;}'
        + '.detail-groups > dl dt,.enen-groups >dl dt{color:' + COLOR + '; padding:2px 6px 4px 6px;font-size:16px;border-radius:4px; background-color:#f8f8f8;border:1px solid #e6e6e6;}'
        + '.detail-groups > dl dt span.detail-pron{color:#b5b5b5;}'
        + '.enen-groups >dl > dd {font-size:14px;;margin-top:10px;margin-bottom:10px;}'
        // counter CSS计数器，给无序tag增加序列
        + '.detail-groups dd h3{font-size:14px;color:#7979f3}'
        + '.detail-groups dl dd h3:before{display:inline;width:22px;}'
        + '.detail-groups dl > dd:nth-child(1) > p{color:red;}'
        + '.phrase-items li{margin-bottom:10px;}'
        + '.phrase-items span:nth-child(1){font-size:14px;color:' + COLOR + ';display:block;}'
        + '.syn table{background-color:#f8f8f8;border:1px solid #e6e6e6;border-radius:4px;border-spacing:0px;}'
        + '.syn tr:nth-child(2n) {background-color:white;}'
        + '.syn tr td{padding:6px;width:'+ (WIDTH-24)/2+'px; cursor:pointer;}'
        + '.syn tr > td:nth-child(1){border-right:1px solid #e6e6e6;}'




    document.body.onload = () => {
        let style = document.createElement("style")
        let div = document.createElement("div")
        style.id = 'translateDCSS'
        div.id = 'translateD'
        document.querySelector('head').appendChild(style)
        document.body.appendChild(div)

        style.innerHTML += translateDCSSContent
    }



    window.document.body.addEventListener('mouseup', () => {
        let selectedText = window.getSelection().toString()
        if (selectedText !== '') {
            foo(selectedText, en)
            //  foo(selectedText,cj)
            //  foo(selectedText,jc)
        }
        console.log(selectedText)
    }, false)




    // DOM 操作
    function foo(word, type) {
        let url = type + encodeURI(word)
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function (response) {
                let result = response.responseText
                    .replace(/\r\n/g, '')
                    .replace(/\n/g, '')

                // 写入内容
                document.querySelector('#translateD').innerHTML = (
                    result
                        .replace(/<aside class="side">.+<\/aside>/gm, '')
                        .match(/<section class="content">.+<\/section>/gm)[0]
                        .replace(/<script type="text\/javascript">.+<\/script>/gm, '')
                        .replace(/<div class="word-details-ads-placeholder"><\/div>/, '<div id="word-nav">' + result.match(/<ul class="word-nav">.+?<\/ul>/gm) + '<span class="word-nav-point" data-point = "1" style="margin-left:10px;"></span></div>')
                        .replace(/<ul class="word-nav">.+?<\/ul>/, '')
                        .replace(/<ul class="word-nav">/, '<ul class="word-nav" style="margin-left:0px;">')
                        .replace(/<footer.+<\/footer>/gm, '')
                        .replace(/<div class="word-details-ads">.+?<\/div>\s.<\/div>/gm, '')
                        .replace(/<div class="word-details-pane-content".+<\/div>(?=\s.+<\/section>\s.)/gm, '<div id="word-details-pane-content">' + result.match(/<div class="word-details-pane-content".+<\/div>(?=\s.+<\/section>\s.)/gm) + '</div>')
                        .replace(/<div class="word-details-pane-content"/gm, '<div class="word-details-pane-content" style="margin-top:36px";')
                        .replace(/(<h2>网络热点<\/h2>)|(<h2>详细释义<\/h2>)|(<h2>常用短语<\/h2>)|(<h2>英英释义<\/h2>)|(<h2>词形变化<\/h2>)|(<h2>同反义词<\/h2>)|(<h2>词义辨析<\/h2>)/gm, '')
                        .replace(/<a\shref="\/w\//gm, '<a data-syn-word="')
                )



                // event 'wheel' can used in chrome&firefox
                let stopScoll = function (event) {
                    event.preventDefault()
                }
                document.querySelector('#translateD').addEventListener('mouseenter', e => {
                    document.querySelector('html').addEventListener('wheel', stopScoll, false)

                    document.querySelector('#translateD').addEventListener('mouseleave', e => {
                        document.querySelector('html').removeEventListener('wheel', stopScoll, false)
                    })
                })


                // for content tag
                let data_point = 1
                // 1.tag switch

                let wordNav = function () {

                    let watchWheel = function () {
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
                        document.querySelectorAll('.word-details-pane-content > div').forEach(e => {
                            e.style.display = 'none'
                        })
                        document.querySelector(divSelectorPath).style.display = 'block'
                        document.querySelector('.word-details-pane-content').style.marginTop = '36px'
                    }

                    // switch nav
                    let wordNavTagSwitch = function (type) {
                        const nav = document.querySelector('.word-nav')
                        const navPoint = document.querySelector('.word-nav-point')
                        const navLiNum = (nav.childNodes.length - 1) / 2

                        const navlength = parseInt(WIDTH / 74)

                        let navScoll = function () {
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
                            navScoll()
                            wordDetilShow()
                        }
                        else if (type == 'down' && data_point < navLiNum) {
                            data_point++
                            navScoll()
                            wordDetilShow()
                        }
                    }


                    document.querySelector('#word-nav').addEventListener('mouseenter', e => {
                        // // add Listener
                        document.querySelector('#word-nav').addEventListener('wheel', watchWheel, false)
                    })
                    document.querySelector('#word-nav').addEventListener('mouseleave', e => {
                        // remove Listener
                        document.querySelector('#word-nav').removeEventListener('wheel', watchWheel, false)
                    })
                }

                wordNav()

                let wordDetail = function () {
                    // 2.content detail
                    const wordDetailsId = document.querySelector('#word-details-pane-content')
                    const wordDetailsClass = document.querySelector('.word-details-pane-content')

                    let wordDetailHeight
                    const formHeight = parseInt(getComputedStyle(document.querySelector('#translateD'), null).height.replace(/px/, ''))
                    const headerHeight = parseInt(getComputedStyle(document.querySelector('.word-details-pane-header'), null).height.replace(/px/, ''))
                    const navHeight = parseInt(getComputedStyle(document.querySelector('.word-nav'), null).height.replace(/px/, ''))

                    let detailHeight

                    const scollDistance = 120


                    // 
                    wordDetailsId.addEventListener('mouseenter', e => {
                        wordDetailHeight = parseInt(getComputedStyle(wordDetailsClass, null).height.replace(/px/, ''))
                        wordDetailsClass.addEventListener('wheel', wordDetailScoll, false)
                    })
                    wordDetailsId.addEventListener('mouseleave', e => {
                        wordDetailHeight = parseInt(getComputedStyle(wordDetailsClass, null).height.replace(/px/, ''))
                        wordDetailsClass.removeEventListener('wheel', wordDetailScoll, false)
                    })


                    // 
                    let wordDetailScoll = function () {
                        let wordDetailsClassMarginTop = parseInt(getComputedStyle(wordDetailsClass, null).marginTop.replace(/px/, ''))

                        if (event.deltaY < 0) {
                            if (wordDetailsClassMarginTop + scollDistance > 36) {
                                wordDetailsClass.style.marginTop = '36px'
                            }
                            else {
                                wordDetailsClass.style.marginTop = wordDetailsClassMarginTop + scollDistance + 'px'
                            }
                        }
                        // 内容高度 - div 高度
                        else if (event.deltaY > 0) {
                            detailHeight = formHeight - headerHeight - navHeight

                            if (wordDetailHeight > detailHeight) {
                                if (-(wordDetailHeight - detailHeight) > wordDetailsClassMarginTop - 120) {
                                    wordDetailsClass.style.marginTop = -(wordDetailHeight - detailHeight) + 'px'
                                } else {
                                    wordDetailsClass.style.marginTop = wordDetailsClassMarginTop - 120 + 'px'
                                }
                            }
                        }
                    }

                }
                wordDetail()

                let wordSyn = function () {
                    // 同反义词跳转
                    if(document.getElementsByClassName('syn').length !== 0){
                        document.querySelector('.syn').addEventListener('click', e => {
                            if(e.target.tagName == 'A'){
                                foo(e.target.getAttribute('data-syn-word'),en)
                            }
                        })
                    }     
                }

                wordSyn()
            }
        })
    }

})()