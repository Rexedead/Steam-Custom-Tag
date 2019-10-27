// ==UserScript==
// @author Rexedead
// @name SteamCustomTag
// @version 1.1
// @description Organize Steam Wishlist Collection via tags
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @grant       GM_addStyle
// @namespace https://github.com/Rexedead/Steam-Custom-Tag
// @include *.steamcommunity.com/id/*/wishlist*
// @include *.steamcommunity.com/profiles/*/wishlist*
// @include *.steampowered.com/wishlist/id/*
// @include *.steampowered.com/wishlist/profiles/*
// @require  https://code.jquery.com/jquery-1.8.3.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @downloadURL https://github.com/Rexedead/Steam-Custom-Tag/raw/master/SteamCustomTag.user.js
// @updateURL   https://github.com/Rexedead/Steam-Custom-Tag/raw/master/SteamCustomTag.meta.js
// ==/UserScript==

waitForKeyElements(".sort_order", main);
GM_addStyle(".customTagInput { white-space: nowrap; margin: 0; padding: 7px 10px; height: 20px; width: 100px; box-sizing: border-box;    background-color: rgba(0,0,0,0.1); border: 1px solid #000; color: #fff; border-radius: 3px; box-shadow: 0 0 3px rgba(0,0,0,0.5) inset, 1px 1px 0 0 rgba(255,255,255,0.2); margin-left:10px; } .customLabel{padding: 1px 10px 2px 10px; margin-right: 3px} .removeTagBtn{padding: 3px 10px 2px 10px; margin-right: 3px} @media screen and (max-width: 910px){.wishlist_row .platform_icons { width: 70%; pointer-events: auto;  }}");

let gamesArr = GM_listValues();

//Clear data
// let keysToKeep = [];
// let keys = GM_listValues();
// for (let key of keys) {
//   if (!keysToKeep.includes(key)) {
//     GM_deleteValue(key);
//   }
// }

function main() {
    'use strict';
    // console.log(g_rgAppInfo);
    let customInp = '<input type="text" size="40" class="customTagInput"><label class="btnv6_blue_hoverfade btn_small customLabel">Add</label>';
    let removeButton = '<button class="btnv6_blue_hoverfade btn_small removeTagBtn">Remove</button>';
    let emptyOrSpace = (/.*\S.*/);
    var target = document.getElementById("wishlist_ctn");
    var config = {
        childList: true,
    };


    gmRestoreOnStart()

    $(".platform_icons").each(function () {
        $(this).append(customInp);
        inputListeners()
    });

    var observer = new MutationObserver(function (mutationRecords, observer) {
        $(mutationRecords).each(function (mutatorIndex, mutatorObj) {
            if (mutatorObj.addedNodes.length > 0) {
                // console.log($(mutatorObj.addedNodes[0].children[2].children[2].children[1].children[0]));
                // console.log($(mutatorObj.addedNodes[0].children[2]));
                if ((!$(mutatorObj.addedNodes[0]).find(".platform_icons").has('input').length)) {
                    $(mutatorObj.addedNodes[0]).find(".platform_icons").append(customInp);
                    inputListeners();
                }

                $(gamesArr).each(function (index) {
                    if (($(mutatorObj.addedNodes[0]).find('.tags').has('button.customTag').length == 0) &&
                        $(mutatorObj.addedNodes[0]).data("app-id").toString() == gamesArr[index]) {
                        // console.log(mutatorObj.addedNodes[0]);
                        let gid = gamesArr[index];
                        let gvl = JSON.parse(GM_getValue(gid));
                        for (let j = 0; j < gvl.length; j++) {
                            $(mutatorObj.addedNodes[0]).find('.tags').append('<button class="btnv6_blue_hoverfade btn_small customTag customLabel">' +
                                gvl[j] + '</button>');
                        }
                        tagListenerButton();
                    }
                })
            };
        });

    });
    observer.observe(target, config);

    function inputListeners() {
        $('input.customTagInput').keyup(function (e) {
            let tagArr = $(this).closest('.lower_container').find('.tags button');
            if (e.keyCode == 13) {
                if (emptyOrSpace.test($(this).val().trim()) &&
                    ($(this).closest('div').find('button.removeTagBtn').length == 0)
                ) {
                    $(this).closest('.lower_container').find('.tags').append('<button class="btnv6_blue_hoverfade btn_small customTag customLabel">' +
                        $(this).val().trim() + '</button>');
                    injectTag($(this).val().trim(), $(this).closest('.lower_container').find('.tags'));
                    $(this).val('');
                }
            }


            for (let index = 0; index < tagArr.length; index++) {
                if ($(this).closest('div').find('button.removeTagBtn').length > 0) {
                    $(this).closest('div').find('button.removeTagBtn').remove();
                }
                if ($(this).val() == tagArr[index].innerText) {
                    $(this).closest(".platform_icons").append(removeButton);
                    $(this).next('label.customLabel').hide()
                    removeBind()
                    return;
                } else {
                    $(this).next('label.customLabel').show();
                    $(this).closest('div').find('button.removeTagBtn').remove();

                }
            }
        });



        $('label.customLabel').click(function () {
            if (emptyOrSpace.test($(this.previousSibling).val().trim())) {
                $(this).closest('.lower_container').find('.tags').append('<button class="btnv6_blue_hoverfade btn_small customTag customLabel">' +
                    $(this.previousSibling).val().trim() + '</button>');
                injectTag($(this.previousSibling).val().trim(), $(this).closest('.lower_container').find('.tags'));
                $(this.previousSibling).val('');
            }
        });

    }

    function removeBind() {
        $('button.removeTagBtn').click(function () {
            let inputValue = $(this).closest('div').find('input.customTagInput');
            let tagArr = $(this).closest('.lower_container').find('.tags button');
            for (let index = 0; index < tagArr.length; index++) {
                if (inputValue.val() == tagArr[index].innerText) {
                    tagArr[index].remove();
                    ejectTag(inputValue.val(), $(this).closest('.lower_container').find('.tags'));
                    inputValue.val('');
                    $(this).closest('div').find('label.customLabel').show();
                    $(this).remove();

                }
            }
        });
    }

    function injectTag(tag, block) {
        let appId = $(block).closest(".wishlist_row[data-app-id]").data("app-id");
        $.each(g_rgAppInfo, function (key, data) {
            if (key == appId) {
                data.tags.push(tag)
            }
        });
        tagListenerButton();
        gmSave(appId, block);
    };

    function injectGMTag(tag, gid) {
        $.each(g_rgAppInfo, function (key, data) {
            if (key == gid) {
                data.tags.push(tag)
            }
        });
        tagListenerButton();
    };

    function tagListenerButton() {
        $('button.customTag').click(function () {
            let currentTag = $(this).text();
            $('#wishlist_search').val(currentTag).focus();
            document.querySelector("#wishlist_search").dispatchEvent(new Event('keyup'))
        });

    }

    function gmSave(appId, block) {
        let tagArr = $(block).closest('.lower_container').find('.tags button');
        var tempArr = [];
        for (let index = 0; index < tagArr.length; index++) {
            tempArr.push(tagArr[index].innerText)
        }
        console.log("Tags "+tempArr +" for game id "+ appId + " saved");
        GM_setValue(appId, JSON.stringify(tempArr));
    }

    function gmRestoreOnStart() {
        for (let index = 0; index < gamesArr.length; index++) {
            let gid = gamesArr[index];
            let gvl = JSON.parse(GM_getValue(gamesArr[index]));
            console.log(gid, gvl);
            for (let j = 0; j < gvl.length; j++) {
                $("[data-app-id=" + gid + "]").find('.tags').append('<button class="btnv6_blue_hoverfade btn_small customTag customLabel">' +
                    gvl[j] + '</button>');
                injectGMTag(gvl[j], gid);
            }
        }
    }

    function ejectTag(tag, block) {
        let appId = $(block).closest(".wishlist_row[data-app-id]").data("app-id");
        console.log("Tag "+tag+" removed");

        $.each(g_rgAppInfo, function (key, data) {
            if (key == appId) {
                data.tags = jQuery.grep(data.tags, function (value) {
                    return value != tag;
                });
            }
        });
        gmSave(appId, block);
    };
}
