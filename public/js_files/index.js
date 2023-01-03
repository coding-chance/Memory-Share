import { doc, setDoc, addDoc, getDoc, getDocs, onSnapshot, initializeFirestore, getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
const db = getFirestore();
const postList = document.querySelector('.posts');
const loggedOutElements = document.querySelectorAll('.logged-out');
const loggedInElements = document.querySelectorAll('.logged-in');
const accountInfo = document.querySelector('.account-info');
export const toggleElements = (user) => {
    if (user) {
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef).then((snapshot) => {
            const userInfo = snapshot.data();
            const html = `
                <div class="account-name">
                    ログイン中のユーザー名:
                    <div class="account-name-data">${userInfo.userName}</div>
                </div>
                <div class="account-introduction">
                    プチ自己紹介文:
                    <div class="account-introduction-data">${userInfo.introduction}<div>
                </div>
            `;
            accountInfo.innerHTML = html;
        }).catch(error => {
            console.log("ドキュメントの取得に失敗したため、ユーザー情報を表示できません。エラーメッセージは以下のとおりです。\n", error.message);
        });
        loggedInElements.forEach(item => item.style.display = 'block');
        loggedOutElements.forEach(item => item.style.display = 'none');
    } else {
        accountInfo.innerHTML = '';
        loggedInElements.forEach(item => item.style.display = 'none');
        loggedOutElements.forEach(item => item.style.display = 'block');
    }
};
export const appendPost = (data) => {
    let html = '';
    if(data.length) {
        data.forEach(document => {    
            const post = document.data();
            const docId = document.id;
            const docRef = doc(db, "users", post.author);
            const userName = getDoc(docRef).then( (snapshot) => {
                const userName = snapshot.data().userName;
                const li = `
                    <li class="post" id="${docId}">
                        <div class="collapsible-header grey lighten-4">
                            <div class="post-title">${post.title}</div>
                            <div class="author">投稿者: ${userName}</div>
                            <div class="posted-date">投稿日時: ${post.postedDate}</div>
                        </div>
                        <div class="collapsible-body white"> 
                            <img src="${post.url}">
                            <p>${post.content}</p>
                            <a href="#" class="waves-effect waves-light btn center-align edit-button modal-trigger" data-target="modal-edit" id='edit-button'>
                                <i class="material-icons edit-icon">edit</i>編集する
                            <a>
                        </div>
                        
                    </li>
                `;
                html += li;
                postList.innerHTML = html;
            }).catch(error => {
                console.log("ドキュメントの取得に失敗したため、投稿を表示できません。エラーメッセージは以下のとおりです。\n", error.message);
            });
        });
    } else {
        postList.innerHTML = `
            <h4 class="center-align">ログインして下さい<br></h4>
            <h6 class="center-align">まだアカウントをお持ちで無い方は、会員登録を行ってください</h6>
        `;
    }

};
document.addEventListener( 'DOMContentLoaded', function(){
    var modals = document.querySelectorAll('.modal');
    var modal_options = {
        "opacity": 0.5, 
        "inDuration": 300, 
        "outDuration": 500,
        "startingTop": "100%",
        "endingTop": "3%",
    }
    M.Modal.init(modals, modal_options);
    var collapsibles = document.querySelectorAll('.collapsible');
    M.Collapsible.init(collapsibles);
});
document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('.sidenav');
    let options = {
        edge: 'right',    
        draggable: true, 
        inDuration: 300, 
        outDuration: 300, 
    };
    let sideNavInstance = M.Sidenav.init(elems, options);
});