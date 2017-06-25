// ==UserScript==
// @author Rexedead, Hate
// @name SteamWishListTool
// @namespace steam-categories
// @version 0.90
// @description steam-categories
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @include *steamcommunity.com/id/*/wishlist*
// @include *steamcommunity.com/profiles/*/wishlist*
// ==/UserScript==

window.addEventListener("load", Greasemonkey_main, false);

function Greasemonkey_main() {
    (function () {
        'use strict';

        // Your code here...
        //ИТА ЩЕДЕВРЕЛЬНЭ!


        selfpage();
        function selfpage() {
            var headNick = document.getElementsByClassName('whiteLink')[0].innerHTML;
            var bodyNick = document.getElementsByClassName('username')[1].innerHTML.trim();
            if (headNick != bodyNick) {
                throw new Error("Not your page");
            }
        }


        var DivBar = document.createElement('div');
        var addTextField = document.createElement('input');
        var addButton = document.createElement('button');
        var child = document.getElementById('wishlist_items');
        var span = document.createElement('span');
        var categoryList = document.createElement('div');
        var donBut = document.createElement('button');
        var donSpan = document.createElement('span');
        var restoreWishlistSave = GM_getValue('wltools', "");
        var observer;

        span.appendChild(document.createTextNode("Add new category"));

        addButton.appendChild(span);
        addButton.className = "btnv6_blue_hoverfade btn_small ";
        addButton.type = "button";
        addButton.onclick = formcheck;
        addButton.style = "outline: none;";

        addTextField.type = "text";
        addTextField.name = "TextField";

        DivBar.style = "margin-bottom: 13px;";
        DivBar.className = "Add_Button_Bar";
        DivBar.name = "barName";

        donSpan.appendChild(document.createTextNode("DONATE"));
        donSpan.style = "color: rgb(255, 249, 0);";

        donBut.className = "btnv6_blue_hoverfade btn_small ";
        donBut.type = "button";
        donBut.appendChild(donSpan);
        donBut.style = "outline: none;";
        donBut.onclick = donate;

        categoryList.className = "categoryList";
        categoryList.classList.add("droptarget");

        //Form Position
        DivBar.appendChild(addTextField);
        DivBar.appendChild(addButton);
        DivBar.appendChild(donBut);
        child.parentNode.insertBefore(DivBar, child);
        child.insertBefore(categoryList, child.firstChild);
        child.classList.add("droptarget");
        restore();


        //Functions

        function save() {

            var stringOfSave = "";
            var arrOfDetails;

            arrOfDetails = categoryList.childNodes;
            for (var inD = 0; inD < arrOfDetails.length; inD++) {
                stringOfSave += (categoryList.childNodes[inD].className);
                var cat_items = arrOfDetails[inD].querySelectorAll('.wishlistRow');
                for (var j = 0; j < cat_items.length; j++) {
                    var item_id = cat_items[j].id; //В переменной item_id хранится id j элемента категории
                    stringOfSave += "," + item_id;
                }
                stringOfSave += "^";
            }
            stringOfSave = stringOfSave.replace(/\^$/, "");

            //console.log(stringOfSave.valueOf());

            GM_setValue('wltools', stringOfSave);

        }

        function restore() {
            restoreWishlistSave = GM_getValue('wltools');

            if (restoreWishlistSave.length > 0) {
                var wlitemsUns = restoreWishlistSave.valueOf().split("^");
                var wlItemsByCat;
                for (var cat = 0; cat < wlitemsUns.length; cat++) {
                    wlItemsByCat = wlitemsUns[cat].valueOf().split(",");
                    addTag(wlItemsByCat[0]);
                    var category = child.getElementsByClassName(wlItemsByCat[0]);
                    for (var item = 1; item < wlItemsByCat.length; item++) {
                        var game = document.getElementById(wlItemsByCat[item]);
                        category[0].appendChild(game);
                    }
                }
                //console.log(wlItemsByCat[0]);
                // console.log(wlitems);
            }

        }

        function addGameInCategory(addInCategoryButton) {
            var activeButtons = document.querySelectorAll('.push');
            var addSpan = addInCategoryButton.firstElementChild;

            addInCategoryButton.parentNode.lastChild.onclick = cancel;
            addInCategoryButton.parentNode.lastChild.firstElementChild.textContent = "Cancel";

            for (var i = 0; i < activeButtons.length; i++) {
                activeButtons[i].firstElementChild.textContent = "Add games";
                activeButtons[i].classList.remove("push");
                var button = activeButtons[i];
                activeButtons[i].onclick = function () { addGameInCategory(button); };
            }

            function cancel() {
                addInCategoryButton.firstElementChild.textContent = "Add games";
                addInCategoryButton.onclick = again;
                addInCategoryButton.parentNode.lastChild.onclick = function () { remGames(addInCategoryButton.parentNode.lastChild); };
                addInCategoryButton.parentNode.lastChild.firstElementChild.textContent = "Remove games";
                var game = document.querySelectorAll('.selection');
                for (var i = 0; i < game.length; i++) {
                    game[i].parentNode.remove();
                }
            }

            addSpan.textContent = "Add selected games";

            addInCategoryButton.onclick = addInCurrentCategory;
            addInCategoryButton.classList.add("push");

            addCheckBox();

            function again() {
                addGameInCategory(addInCategoryButton);
            }

            function addInCurrentCategory() {
                addList(addInCategoryButton);
            }


        }

        function addList(addInCategoryButton) {
            var game = document.querySelectorAll('.selection');
            addInCategoryButton.lastChild.textContent = "Add games";
            addInCategoryButton.onclick = again;
            var games = addInCategoryButton.parentNode.parentNode.querySelectorAll('.wishlistRow');

            for (var i = 0; i < game.length; i++) {
                if (game[i].checked) {
                    observer.observe(game[i].parentNode.parentNode, {
                        attributes: true,
                    });
                    game[i].parentNode.parentNode.classList.add("inCategory");
                    addInCategoryButton.parentNode.parentNode.appendChild(game[i].parentNode.parentNode);
                }
                game[i].parentNode.remove();
                //addInCategoryButton.parentNode.lastChild.onclick = function () { remGames(addInCategoryButton.parentNode.lastChild); };
                addInCategoryButton.parentNode.lastChild.firstElementChild.textContent = "Remove games";
            }

            function again() {
                addGameInCategory(addInCategoryButton);
            }
            save();

        }

        function remGames(Button) {
            Button.parentNode.firstElementChild.onclick = cancel;
            Button.parentNode.firstElementChild.firstElementChild.textContent = "Cancel";
            delCheckBox(Button);
            Button.lastChild.textContent = "Remove Selected Games";
            Button.onclick = remFromList;

            function delGame() {
                remGames(Button);
            }

            function cancel() {
                Button.firstElementChild.textContent = "Remove Games";
                Button.onclick = delGame;
                Button.parentNode.firstElementChild.onclick = function () { addGameInCategory(Button.parentNode.firstElementChild); };
                Button.parentNode.firstElementChild.firstElementChild.textContent = "Add games";
                var sfrgame = Button.parentNode.parentNode.querySelectorAll('.selection');
                for (var i = 0; i < sfrgame.length; i++) {
                    sfrgame[i].parentNode.remove();
                }
            }

            function remFromList() {
                var game = Button.parentNode.parentNode.querySelectorAll('.inCategory');
                var sfrgame = Button.parentNode.parentNode.querySelectorAll('.selection');
                for (var i = 0; i < sfrgame.length; i++) {
                    if (sfrgame[i].checked) {
                        game[i].parentNode.parentNode.parentNode.appendChild(game[i]);
                        game[i].classList.remove("inCategory");
                    }
                    sfrgame[i].parentNode.remove();
                }
                Button.firstElementChild.textContent = "Remove Games";
                Button.onclick = delGame;
                Button.parentNode.firstElementChild.onclick = function () { addGameInCategory(Button.parentNode.firstElementChild); };
                Button.parentNode.firstElementChild.firstElementChild.textContent = "Add games";
                save();
            }
        }

        function formcheck() {
            if (addTextField.getValue() === "") {
                alert("Error: empty field!");
            } else {
                if (categoryList.getElementsByClassName(addTextField.getValue()).length > 0) {
                    alert("This category already exists");
                } else {
                    addTag(addTextField.getValue());
                }
            }
        }

        function addTag(cat_name) {
            var category = document.createElement('details');
            var categoryName = document.createElement('summary');
            var addInCategoryButton = document.createElement('button');
            var remInCategoryButton = document.createElement('button');
            var remGamesButton = document.createElement('button');
            var addSpan = document.createElement('span');
            var remCatSpan = document.createElement('span');
            var remGamesSpan = document.createElement('span');
            var addRemoveDiv = document.createElement('div');
            observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.attributeName === "class") {
                        category.addEventListener("mouseout", handl);
                    }
                });
            });

            function handl(event) {
                var drag = categoryList.querySelectorAll('.inDrag');
                if (drag.length > 0) {
                    //alert("asd");
                    drag[0].classList.remove("inCategory");
                    child.appendChild(drag[0]);
                    save();
                }
                category.removeEventListener("mouseout", handl);
            }

            addSpan.appendChild(document.createTextNode("Add games"));
            remCatSpan.appendChild(document.createTextNode("Remove Category"));
            remGamesSpan.appendChild(document.createTextNode("Remove Games"));

            addInCategoryButton.appendChild(addSpan);
            addInCategoryButton.className = "btnv6_blue_hoverfade btn_small ";
            addInCategoryButton.type = "button";
            addInCategoryButton.onclick = add;
            addInCategoryButton.style = "outline: none;";

            remInCategoryButton.appendChild(remCatSpan);
            remInCategoryButton.className = "btnv6_blue_hoverfade btn_small ";
            remInCategoryButton.style = "float: right; outline: none;";
            remInCategoryButton.type = "button";
            remInCategoryButton.onclick = del;

            remGamesButton.appendChild(remGamesSpan);
            remGamesButton.className = "btnv6_blue_hoverfade btn_small ";
            remGamesButton.type = "button";
            remGamesButton.onclick = delGame;
            remGamesButton.style = "outline: none;";

            addRemoveDiv.appendChild(addInCategoryButton);
            addRemoveDiv.appendChild(remGamesButton);
            addRemoveDiv.style = "margin-bottom: 2%";

            categoryName.appendChild(document.createTextNode(cat_name)); //get user text input
            categoryName.style = "white-space: nowrap; font-size: 16px; font-weight: 300; color: #ffffff; padding: 5px; cursor: default; cursor: default; cursor: -moz-default; outline: none;";
            categoryName.appendChild(remInCategoryButton);
            category.appendChild(categoryName);
            category.appendChild(addRemoveDiv);
            category.className = cat_name;



            category.style = "min-height: inherit; background-color: rgba( 84, 133, 183, 0.2); color: #56707f; padding: 8px 1%; margin-bottom: 15px; position: relative;";
            category.on("DOMNodeInserted", function (event) {
                var games = category.querySelectorAll('.wishlistRow');
                for (var i = 0; i < games.length; i++) {
                    if (!games[i].classList.contains('inCategory')) {
                        observer.observe(games[i], {
                            attributes: true
                        });
                        games[i].classList.add("inCategory");
                        save();
                    }
                }
            });

            addTextField.value = null;

            categoryList.appendChild(category);
            save();

            function add() {
                addGameInCategory(addInCategoryButton);
            }

            function del() {
                var gamesMas = category.querySelectorAll('.inCategory');
                var cat = category.parentNode.parentNode;
                for (var i = 0; i <= gamesMas.length - 1; i++) {
                    gamesMas[i].classList.remove("inCategory");
                    cat.appendChild(gamesMas[i]);
                }
                if (category.querySelectorAll('.push').length > 0) {
                    var game = document.querySelectorAll('.selection');
                    for (var j = 0; j < game.length; j++) {
                        game[j].parentNode.remove();
                    }
                }
                category.remove();
                save();
            }

            function delGame() {
                remGames(remGamesButton);
            }


        }

        function delCheckBox(Button) {
            var game = Button.parentNode.parentNode.querySelectorAll('.inCategory');
            function check() {
                if (this.firstElementChild.checked === false) {
                    this.firstElementChild.checked = true;
                } else {
                    this.firstElementChild.checked = false;
                }
            }

            for (var i = 0; i <= game.length - 1; i++) { //PROBLEM PLACE
                if (game[i].classList.contains('inCategory')) {
                    var checkBox = document.createElement('input');
                    var text = document.createElement('button');
                    text.appendChild(checkBox);
                    text.appendChild(document.createTextNode("Select for remove"));
                    text.className = "btnv6_blue_hoverfade btn_small ";
                    text.style = "cursor: default; cursor: pointer; cursor: -moz-default; outline: none;position: relative; display: block; padding-right: 1%; margin-top: 1%;";
                    text.type = "button";
                    text.onclick = check;
                    checkBox.type = "checkbox";
                    checkBox.className = "selection";
                    game[i].appendChild(text);
                }
            }

        }

        function addCheckBox() {
            var game = document.querySelectorAll('.wishlistRow');
            function check() {
                if (this.firstElementChild.checked === false) {
                    this.firstElementChild.checked = true;
                } else {
                    this.firstElementChild.checked = false;
                }
            }

            for (var i = 0; i <= game.length - 1; i++) { //PROBLEM PLACE
                if (!game[i].classList.contains('inCategory') && game[i].querySelectorAll('.selection').length <= 0) {
                    var checkBox = document.createElement('input');
                    var text = document.createElement('button');
                    text.appendChild(checkBox);
                    text.appendChild(document.createTextNode("Add game to category"));
                    text.className = "btnv6_blue_hoverfade btn_small ";
                    text.style = "cursor: default; cursor: pointer; cursor: -moz-default; outline: none; position: relative; display: block; padding-right: 1%; margin-top: 1%;";
                    text.type = "button";
                    text.onclick = check;
                    checkBox.type = "checkbox";
                    checkBox.className = "selection";
                    game[i].appendChild(text);
                }
            }
        }

        function donate() {
            var win = window.open("https://steamcommunity.com/tradeoffer/new/?partner=22861895&token=GtBPPaCq", '_blank');
            win.focus();
        }


    })();
}