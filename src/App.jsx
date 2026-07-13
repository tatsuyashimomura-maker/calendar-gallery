import { useState } from "react";
import "./App.css";

const documents = {
  "2026-07-09": {
    type: "document",
    thumbnail: "/documents/2026-07-09/page-1.png",
    pages: [
      "/documents/2026-07-09/page-1.png",
      "/documents/2026-07-09/page-2.png",
      "/documents/2026-07-09/page-3.png",
      "/documents/2026-07-09/page-4.png",
    ],
    pdf: "/documents/2026-07-09/document.pdf",
  },

  "2026-07-10": {
    type: "dispatch",
    data: "/data/2026-07-10.json",
  },
};

const formatJapaneseDate = (dateString) => {
  const [, month, day] = dateString.split("-");

  return `${Number(month)}月${Number(day)}日`;
};

function App() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [dispatchData, setDispatchData] = useState([]);
  
  const loadingData = dispatchData.filter((row) => row["区分"] === "積");
  const unloadingData = dispatchData.filter((row) => row["区分"] === "卸");



  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= lastDate; day++) {
    calendarDays.push(day);
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const createDateKey = (day) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");

    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const openDocument = async (dateKey, document) => {
    setSelectedDate(dateKey);
    setSelectedDocument(document);

    if (document.type === "dispatch") {
      const response = await fetch(document.data);
      const data = await response.json();
      setDispatchData(data);
    }

    window.scrollTo(0, 0);
  };

  const closeDocument = () => {
    setSelectedDocument(null);
    setSelectedDate("");
    setDispatchData([]);
    window.scrollTo(0, 0);
  };

  if (selectedDocument) {
    return (
      <div className="app">
        <header className="header">
          <h1>Calendar Gallery</h1>
          <p>資料閲覧カレンダー</p>
        </header>

        <main className="main-content">
          <section className="calendar-section document-viewer">
            <div className="document-viewer-header">
              <button
                type="button"
                className="back-button"
                onClick={closeDocument}
              >
                ＜ カレンダーに戻る
              </button>

              <h2>{selectedDate} の資料</h2>
            </div>

            {selectedDocument.type === "document" && (
              <>
                <div className="document-pages">
                  {selectedDocument.pages.map((page, index) => (
                    <figure className="document-page" key={page}>
                      <figcaption className="document-page-number">
                        {index + 1}ページ
                      </figcaption>

                      <img
                        src={page}
                        alt={`${selectedDate} ${index + 1}ページ`}
                      />
                    </figure>
                  ))}
                </div>

                <a
                  className="pdf-button"
                  href={selectedDocument.pdf}
                  download
                >
                  PDFをダウンロード
                </a>
              </>
            )}

 {selectedDocument.type === "dispatch" && (
  <div className="dispatch-viewer">

    {/* =====================
        積
    ===================== */}

    <div className="dispatch-section">
      <div className="dispatch-title">
        <strong>{formatJapaneseDate(selectedDate)}</strong>
<h3>積 {loadingData.length}件</h3>
      </div>

      <div className="dispatch-table-wrapper">
        <table className="dispatch-table">
          <thead>
            <tr>
              <th>CH番号</th>
              <th>運転手</th>
              <th>タンク前</th>
              <th>タンク後</th>
              <th>発地</th>
              <th>発時刻</th>
              <th>船会社</th>
              <th>乗船地</th>
              <th>乗船日</th>
              <th>乗船時刻</th>
              <th>下船地</th>
              <th>着地</th>
              <th>着日</th>
              <th>着時刻</th>
              <th>備考</th>
            </tr>
          </thead>

          <tbody>
            {loadingData.map((row, index) => (
              <tr key={`loading-${row["伝票番号"]}-${index}`}>
                <td>{row["ＣＨ車両コード"]}</td>
                <td>{row["運転手名"] || row["傭車先名"]}</td>
                <td>{row["タンク前"]}</td>
                <td>{row["タンク後"]}</td>
                <td>{row["発地名１"]}</td>
                <td>{row["発時刻"]}</td>
                <td>{row["船会社名"]}</td>
                <td>{row["乗船地名"]}</td>
                <td>{row["乗船日"]}</td>
                <td>{row["乗船時刻"]}</td>
                <td>{row["下船地名"]}</td>
                <td>{row["着地名１"]}</td>
                <td>{row["着日"]}</td>
                <td>{row["着時刻"]}</td>
                <td>{row["備考"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>


    {/* =====================
        卸
    ===================== */}

    <div className="dispatch-section">
      <div className="dispatch-title">
        <strong>{formatJapaneseDate(selectedDate)}</strong>
        <h3>卸 {unloadingData.length}件</h3>
      </div>
    </div>

      <div className="dispatch-table-wrapper">
        <table className="dispatch-table">
          <thead>
            <tr>
              <th>CH番号</th>
              <th>卸運転手</th>
              <th>発地</th>
              <th>船会社</th>
              <th>下船地</th>
              <th>下船日</th>
              <th>下船時刻</th>
              <th>着地</th>
              <th>着時間</th>
              <th>備考</th>
            </tr>
          </thead>

          <tbody>
            {unloadingData.map((row, index) => (
              <tr key={`unloading-${row["伝票番号"]}-${index}`}>
                <td>{row["ＣＨ車両コード"]}</td>
                <td>{row["卸運転手名"] || row["卸傭車先名"]}</td>
                <td>{row["発地名１"]}</td>
                <td>{row["船会社名"]}</td>
                <td>{row["下船地名"]}</td>
                <td>{row["下船日"]}</td>
                <td>{row["下船時刻"]}</td>
                <td>{row["着地名１"]}</td>
                <td>{row["着時刻"]}</td>
                <td>{row["備考"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

)}          
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Calendar Gallery</h1>
        <p>資料閲覧カレンダー</p>
      </header>

      <main className="main-content">
        <section className="calendar-section">
          <div className="calendar-header">
            <button type="button" onClick={goToPreviousMonth}>
              ＜ 前月
            </button>

            <h2>
              {year}年{month + 1}月
            </h2>

            <button type="button" onClick={goToNextMonth}>
              翌月 ＞
            </button>
          </div>

          <div className="calendar">
            <div className="weekday sunday">日</div>
            <div className="weekday">月</div>
            <div className="weekday">火</div>
            <div className="weekday">水</div>
            <div className="weekday">木</div>
            <div className="weekday">金</div>
            <div className="weekday saturday">土</div>

            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    className="empty-day"
                    key={`empty-${index}`}
                  />
                );
              }

              const dateKey = createDateKey(day);
              const document = documents[dateKey];

              return (
                <div
                  className={`calendar-day ${
                    document ? "has-document" : ""
                  }`}
                  key={dateKey}
                  onClick={() => {
                    if (document) {
                      openDocument(dateKey, document);
                    }
                  }}
                >
                  <span>{day}</span>

                  {document?.type === "document" && (
                    <img
                      className="document-thumbnail"
                      src={document.thumbnail}
                      alt={`${dateKey}の資料`}
                    />
                  )}

                  {document?.type === "dispatch" && (
                    <div className="dispatch-thumbnail">
                      配車表
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;