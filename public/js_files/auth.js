import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { query, where, orderBy, collection, doc, updateDoc, setDoc, addDoc, getDoc, getDocs, onSnapshot, initializeFirestore, getFirestore } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { toggleElements, appendPost } from "/js_files/index.js";
const auth = getAuth();
const db = getFirestore();
onAuthStateChanged(auth, (user) => {
    if (user) {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        onSnapshot( 
            q,
            collection(db, "posts"),
            (snapshot) => {
            appendPost(snapshot.docs);  
            toggleElements(user);
        }),
        (error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Error: Firebaseからデータを取得できませんでした\nエラーコード: ", errorCode,);
        };        

    } else {
        toggleElements();
        appendPost([]);
    }
});
const createForm = document.querySelector('#post-form');
createForm.addEventListener('submit', (e) => { 
    e.preventDefault();
    function formatDate(data) {
        var y = data.getFullYear();
        var m = ('00' + (data.getMonth()+1)).slice(-2);
        var d = ('00' + data.getDate()).slice(-2);
        return (y + '-' + m + '-' + d);
    }
    const timestamp = new Date();
    const postedDate = formatDate(new Date());
    const userId = auth.currentUser.uid;
    const newPost = {
        title: createForm.title.value,
        content: createForm.content.value,
        url: createForm.url.value,
        createdAt: timestamp,
        postedDate: postedDate,
        author: userId
    };
    addDoc(collection(db, "posts"), newPost)
    .then(() => {
        const modal = document.querySelector('#modal-post');
        M.Modal.getInstance(modal).close();
        createForm.reset();
    }).catch(error => {
        console.log("投稿することができませんでした。エラーメッセージは以下のとおりです。\n", error.message);
        alert("投稿に失敗しました。\nエラーの原因はシステム管理者に問合せください。");
    });
});
document.addEventListener('click', function(){
    let li = document.querySelectorAll('.posts li');
    for (var i=0; i < li.length; i++) {
        li[i].addEventListener('click', function() {
            var clickedPostId = this.id;
            const docRef = doc(db, "posts", clickedPostId);
            getDoc(docRef).then((snapshot) => {
                const postTitle = snapshot.data().title;
                const postContent = snapshot.data().content;
                const postUrl = snapshot.data().url;
                const editForm = document.querySelector('#edit-form');
                editForm['editTitle'].value = postTitle;
                editForm['editContent'].value = postContent;
                editForm['editUrl'].value = postUrl;
                editForm.setAttribute('doc-id', clickedPostId);
            }).catch(error => {
                console.log("編集用モーダルのフォームに貼り付ける投稿情報の取得に失敗しました。Firestoreとの通信が上手くいかなかった可能性が考えられます。");
            });
        });
    };
});
const editForm = document.querySelector('#edit-form');
editForm.addEventListener('submit', (e) => { 
    e.preventDefault();
    const editedPost = {
        title: editForm.editTitle.value,
        content: editForm.editContent.value,
        url: editForm.editUrl.value,
    };
    const docId = editForm.getAttribute('doc-id');
    const docRef = doc(db, "posts", docId);
    updateDoc(docRef, editedPost)
    .then(() => {
        console.log("編集が完了しました。");
        const modal = document.querySelector('#modal-edit');
        M.Modal.getInstance(modal).close();
        editForm.reset();
    }).catch(error => {
        alert("編集できませんでした。\n\n編集できなかった理由としては、以下の２つが考えられます。\n 1. データベースとの通信に失敗した\n 2. ログイン中のユーザーに編集する権限が与えられてない");
        const modal = document.querySelector('#modal-edit');
        M.Modal.getInstance(modal).close();
        editForm.reset();
        console.log("編集を正常に完了することができませんでした。エラーメッセージは以下のとおりです。\n", error.message);
    });
});
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    const introduction = signupForm['signup-introduction'].value;
    const name = signupForm['signup-name'].value;
    createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        const user = userCredential.user;
        const userInfo = {
            userName: name,
            introduction: introduction
        };
        setDoc(doc(db, "users", user.uid), userInfo)
        .then(() => {
        }).catch(error => {
            console.log("ユーザー情報にまつわるドキュメント作成することができませんでした。エラーメッセージは以下のとおりです。\n", error.message);
        });
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef).then((snapshot) => {
            const userName = snapshot.data().userName;
            console.log("会員登録が完了しました。\nユーザー名： " + userName);
            location.reload()
        }).catch(error => {
            console.log("ドキュメントの取得に失敗したため、ユーザー情報を表示できません。エラーメッセージは以下のとおりです。\n", error.message);
        });
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("エラーコード: \n" + errorCode);
        alert("会員登録に失敗しました。\nエラーメッセージ: \n" + errorMessage);
    });
})
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then((userCredential) => {
        console.log("ログアウトしました。");
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("エラーコード: ", errorCode);
        alert("エラーメッセージ: " + errorMessage);
    });
});
const logoutMobile = document.querySelector('#logout-mobile');
logoutMobile.addEventListener('click', (e) => {
    signOut(auth).then((userCredential) => {
        console.log("ログアウトしました。");
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("エラーコード: ", errorCode);
        alert("正常にログアウト出来ませんでした。\nエラーメッセージは以下のとおりです。: " + errorMessage);
    });
});
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        const user = userCredential.user;
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef)
        .then((snapshot) => {
            const userName = snapshot.data().userName;
            console.log("ログインしました。\nユーザー名； " + userName);
            const modal = document.querySelector('#modal-login');
            M.Modal.getInstance(modal).close();
            loginForm.reset();
            location.reload()
        }).catch(error => {
            console.log("ドキュメントの取得に失敗したため、ユーザー情報を表示できません。エラーメッセージは以下のとおりです。\n", error.message);
        });
    }).catch((error) => {
        console.log("エラーコード: ", error.code);
        console.log("エラーメッセージ: ", error.message);
        alert("ログインに失敗しました。\nEメールアドレスもしくはパスワードが間違っていないか、もう一度確認して下さい。");
    })
});