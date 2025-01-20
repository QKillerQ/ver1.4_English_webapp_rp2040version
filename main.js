let port;
let writer;

let kando = [30, 40, 50, 60, 70, 80, 90, 100, 110]; // 感度保存用

const BUTTON_CLICK_EVENT = document.getElementById("connection");
const BUTTON_CLICK_EVENT_send = document.getElementById("sendButton");
const BUTTON_CLICK_EVENT_request = document.getElementById("requestButton");
const BUTTON_CLICK_EVENT_save = document.getElementById("saveButton");
const button = document.getElementById("updateValue");
const volumeSlider = document.getElementById("volumeSlider");

let reader; // readerが必要な場合に備えて

// シリアルポートの接続処理
BUTTON_CLICK_EVENT.addEventListener("click", async () => {
  try {
    if (!port) {
      // シリアルポートのリクエスト
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      writer = port.writable.getWriter();
      reader = port.readable.getReader(); // readerを追加
    }

    // 送信するデータ
    const data = new TextEncoder().encode("Hello, Serial!\n");

    // データ送信
    await writer.write(data);
    console.log("Data sent: Hello, Serial!");
  } catch (error) {
    console.error("Error:", error);
  }
});

// ウィンドウを閉じる前にポートを閉じる
window.addEventListener("beforeunload", async () => {
  if (writer) writer.releaseLock();
  if (reader) reader.releaseLock(); // readerのロックも解放
  if (port) await port.close();
});

// データ送信処理
BUTTON_CLICK_EVENT_send.addEventListener("click", async () => {
  try {
    // "1002"の送信
    await writer.write(new TextEncoder().encode("1002"));
    for (let i = 0; i <= 9; i++){
      await writer.write(new TextEncoder().encode(kando[i]));
    }
    alert("send");
  } catch (error) {
    console.error("Error in send:", error);
  }
});

// データ要求処理
BUTTON_CLICK_EVENT_request.addEventListener("click", async () => {
  try {
    // "1000"を送信して感度データを要求
    await writer.write(new TextEncoder().encode("1000"));

    for (let i = 0; i <= 8; i++) {
      let isMatched = false;

      while (!isMatched) {
        const data = await reader.read();
        const decodedData = new TextDecoder().decode(data.value); // データをデコード

        // データが予期した形式であるかを確認
        const parts = decodedData.split(":");
        if (parts.length === 2) {
          const [index, value] = parts;

          // データが正しい範囲であることを確認
          if (parseInt(index) === i && !isNaN(value)) {
            const textElement = document.getElementById(`text${i}`);
            const volumeSlider = document.getElementById(`volumeSlider${i}`);

            kando[i] = value; // データを配列に格納
            volumeSlider.value = kando[i]; // スライダーを更新
            textElement.textContent = kando[i]; // スライダー横のテキストを更新

            isMatched = true; // 正しいデータを処理したらループを抜ける
          }
        } else {
          // データが無効な形式の場合はログに記録
          console.warn(`Invalid data format received: ${decodedData}`);
        }
      }
    }

    // alert("ok"); // 最後に一度だけ通知を表示する場合
  } catch (error) {
    console.error("Error in request:", error);
  }
});



// スライダーの入力処理
for (let i = 0; i <= 8; i++) {
  const volumeSlider = document.getElementById(`volumeSlider${i}`);
  const textElement = document.getElementById(`text${i}`);

  volumeSlider.addEventListener("input", () => {
    const volume = volumeSlider.value; // スライダーの値を取得
    textElement.textContent = volume; // スライダー横のテキストを更新
  });
}

