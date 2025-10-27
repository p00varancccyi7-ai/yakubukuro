let firstUser = null;
const speak = (text) => new SpeechSynthesisUtterance(text);

document.getElementById("scan").addEventListener("click", async () => {
  try {
    const reader = new NDEFReader();
    await reader.scan();
    reader.onreading = event => {
      const raw = event.message.records[0].data;
      const user = new TextDecoder().decode(raw);

      if (!firstUser) {
        firstUser = user;
        speechSynthesis.speak(speak(`${user}さんのお薬ですね`));
        document.getElementById("status").innerText = "次に本人タグを読んでください";
      } else {
        if (firstUser === user) {
          speechSynthesis.speak(speak(`${user}さんのお薬です。正しい利用者です`));
        } else {
          speechSynthesis.speak(speak(`違います！薬を戻してください！`));
        }
        firstUser = null;
      }
    };
  } catch (err) {
    alert("NFCが有効か確認してください");
  }
});
