import { useState } from "react";
import "./App.css";

const documents = {
  "2026-07-09": {
    thumbnail: "/documents/2026-07-09/page-1.png",
    pages: [
      "/documents/2026-07-09/page-1.png",
      "/documents/2026-07-09/page-2.png",
      "/documents/2026-07-09/page-3.png",
      "/documents/2026-07-09/page-4.png",
    ],
    pdf: "/documents/2026-07-09/document.pdf",
  },
};

function App() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

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
                >
                  <span>{day}</span>

                  {document && (
                    <img
                      className="document-thumbnail"
                      src={document.thumbnail}
                      alt={`${dateKey}の資料`}
                    />
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