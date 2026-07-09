import { useState } from "react";
import "./App.css";

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

            {calendarDays.map((day, index) =>
              day === null ? (
                <div
                  className="empty-day"
                  key={`empty-${index}`}
                />
              ) : (
                <div className="calendar-day" key={day}>
                  <span>{day}</span>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;