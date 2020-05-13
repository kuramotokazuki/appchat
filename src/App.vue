<template>
  <div id="app">
    <header>
      <h1>ChottoChat</h1>
      <!-- ログイン時にはフォームとログアウトボタン表示-->
      <div class="login-out">
        <div v-if="user.uid" key="login">
          <p class="loginName">Name</p>
          {{ user.displayName }}
          <button type="button" @click="doLogout" class="logoutInBtn">
            ログアウト
          </button>
        </div>
        <!-- 未ログイン時にはログインボタンを表示-->
        <div v-else key="logout">
          <button type="button" @click="doLogin" class="logoutInBtn">
            twitterでログイン
          </button>
        </div>
      </div>
    </header>
    <!-- Firebaseから取得したリストを描画（トランジション付）-->
    <transition-group name="chat" tag="div" class="list content">
      <section
        v-for="{ key, name, image, message } in chat"
        :key="key"
        class="item"
        :class="{ active }"
      >
        <div class="item-image">
          <img src="image" width="40" height="40">
        </div>
        <div class="item-detail">
          <div class="item-name">{{ name }}</div>
          <div class="toDay">{{ today }}</div>
          <div class="item-message">
            <nl2br tag="div" :text="message" />
          </div>
        </div>
      </section>
    </transition-group>
    <!--入力フォーム-->

    <form action="" @submit.prevent="doSend" class="form">
      <!--submitをクリックしても画面遷移しない-->
      <textarea
        v-model="input"
        :disabled="!user.uid"
        @keydown.enter.exact.prevent="doSend"
      >
<!--エンターキーを押すとsend "!user.uid"firebaseの識別子-->
      </textarea>
      <button type="submit" :disabled="!user.uid" class="send-button">
        送信
      </button>
    </form>
  </div>
</template>

<script>
// firebaseモジュール（定型）
import firebase from "firebase";
// 改行を<br>タグに変換するモジュール
import Nl2br from "vue-nl2br";

export default {
  components: { Nl2br },
  data() {
    return {
      user: {}, //ユーザー情報
      chat: {}, //取得したメッセージを入れる配列
      input: "", //入力したメッセ
    };
  },

  created() {
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user ? user : {};
      const ref_message = firebase.database().ref("message");
      if (user) {
        this.chat = [];
        //message に変更があった時のハンドラを登録
        ref_message.limitToLast(10).on("child_added", this.childAdded);
      } else {
        //message に変更があった時のハンドラを解除
        ref_message.limitToLast(10).off("child_added", this.childAdded);
      }
    });
  },
  methods: {
    //ログイン処理
    doLogin() {
      const provider = new firebase.auth.TwitterAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    //ログアウト処理
    doLogout() {
      firebase.auth().signOut();
    },
    //スクロール位置を一番下に移動
    scrollBottom() {
      this.$nextTick(() => {
        window.scrollTo(0, document.body.clientHeight);
      });
    },
    //受け取ったメッセージをchatに追加
    //データベースに新しい要素が追加されると随時呼び出される
    childAdded(snap) {
      const message = snap.val();
      this.chat.push({
        key: snap.key,
        name: message.name,
        image: message.image,
        message: message.message,
      });
      this.scrollBottom();
    },
    doSend() {
      if (this.user.uid && this.input.length) {
        //firebaseにメッセージを追加
        firebase
          .database()
          .ref("message")
          .push(
            {
              message: this.input,
              name: this.user.displayName,
              image: this.user.photoURL
            },
            () => {
              this.input = ""; //フォームを殻にする
            }
          );
      }
    },
  },
};
</script>

<style>
* {
  margin: 0;
  box-sizing: border-box;
}
header {
  background: #ebee42;
  margin-bottom: 1em;
  padding: 2em 3em;
  color: #333;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  text-align: center;
  display: flex;
  justify-content: space-around;
}

.login-out {
  background: #ebee42;
  padding: 15px;
}

.logoutInBtn {
  margin-left: 10px;
  margin-bottom: 15px;
  padding: 15px;
  border-style: none;
  border-radius: 68px;
  border-radius: 47px;
  background: #ebee42;
  box-shadow: 6px 6px 12px #c1c336, -6px -6px 12px #ffff4e;
}

.logoutInBtn:active {
  border-radius: 47px;
  background: linear-gradient(145deg, #d4d63b, #fbff47);
  box-shadow: 6px 6px 12px #c1c336, -6px -6px 12px #ffff4e;
}

.loginname {
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
}

content {
  margin: 0 auto;
  padding: 0 10px;
  max-width: 600px;
}
form {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 0;
  height: 80px;
  width: 100%;
  background: #ebee42;
  box-shadow: rgb(117, 114, 114) 0px 0px 10px ;
}
.form textarea {
  border: 1px solid #ccc;
  border-radius: 2px;
  height: 4em;
  width: calc(100% - 6em);
  resize: none;
}
.list {
  margin: 100px;
}
.item {
  position: relative;
  display: flex;
  align-items: flex-end;
  margin-bottom: 0.8em;
}

.item-image img {
  border-radius: 20px;
  vertical-align: top;
}
.item-detail {
  margin: 0 0 0 1.4em;
}
.item-name {
  font-size: 75%;
}
.item-message {
  position: relative;
  display: inline-block;
  padding: 0.8em;
  background: #ebee42;
  border-radius: 4px;
  line-height: 1.2em;
}

.item-message::before {
  position: absolute;
  content: " ";
  display: block;
  left: -16px;
  bottom: 12px;
  border: 4px solid transparent;
  border-right: 12px solid #ebee42;
}

.remove-button {
  height: 4em;
  width: 4em;
  position: absolute;
  right: 0;
}

.send-button {
  height: 4em;
  margin-left: 5px;
  border-style: none;
  border-radius: 68px;
  border-radius: 47px;
  background: #ebee42;
  box-shadow: 6px 6px 12px #c1c336, -6px -6px 12px #ffff4e;
}
.send-button:active {
  border-radius: 47px;
  background: linear-gradient(145deg, #d4d63b, #fbff47);
  box-shadow: 6px 6px 12px #c1c336, -6px -6px 12px #ffff4e;
}
/* トランジション用スタイル */
.chat-enter-active {
  transition: all 1s;
}
.chat-enter {
  opacity: 0;
  transform: translateX(-1em);
}
</style>
