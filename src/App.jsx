import { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Papa from "papaparse";

import "./App.css";

const salesData = [
  {
    month: "4月",
    sales: 49201650,
    expenses: 28491201,
  },
  {
    month: "5月",
    sales: 49073100,
    expenses: 29369194,
  },
  {
    month: "6月",
    sales: 50162100,
    expenses: 29951106,
  },
];

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

const formatShortDate = (dateString) => {
  if (!dateString) return "";

  const parts = dateString.split("/");

  if (parts.length !== 3) return dateString;

  return `${Number(parts[1])}/${Number(parts[2])}`;
};

function App() {

  const [currentPage, setCurrentPage] = useState("dashboard");

  const [csvData, setCsvData] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState("all");

  const handleCsvUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    complete: (results) => {
      setCsvData(results.data);

      console.log("CSV読込結果:", results.data);
      console.log("CSV列名:", results.meta.fields);
    },
  });
};

const customerList = [
  ...new Set(
    csvData
      .map((row) => row["荷主C"])
      .filter((customer) => customer)
  ),
].sort((a, b) => Number(a) - Number(b));

const filteredCsvData =
  selectedCustomer === "all"
    ? csvData
    : csvData.filter(
        (row) => row["荷主C"] === selectedCustomer
      );

console.log(
  "荷主C9の発日サンプル:",
  filteredCsvData.slice(0, 10).map((row) => row["発日"])
);

const getYearMonth = (dateString) => {
  if (!dateString) return "";

  const [year, month] = dateString.split("/");

  return `${year}-${String(month).padStart(2, "0")}`;
};

const yearMonthList = [
  ...new Set(
    filteredCsvData
      .map((row) => getYearMonth(row["発日"]))
      .filter((yearMonth) => yearMonth)
  ),
].sort();

console.log("年月一覧:", yearMonthList);

const calculateSales = (data) => {
  return data.reduce(
    (sum, row) =>
      sum + Number((row["売上運賃"] || "0").replace(/,/g, "")),
    0
  );
};

const calculateExpenses = (data) => {
  return data.reduce((sum, row) => {
    const payment =
      Number((row["支払運賃"] || "0").replace(/,/g, ""));

    const taxFreePayment =
      Number((row["支払非課税運賃"] || "0").replace(/,/g, ""));

    const unloadingPayment =
      Number((row["卸支払運賃"] || "0").replace(/,/g, ""));

    const unloadingTaxFreePayment =
      Number((row["卸支払非課税運賃"] || "0").replace(/,/g, ""));

    const ferryCost =
      Number((row["フェリー代"] || "0").replace(/,/g, ""));

    return (
      sum +
      payment +
      taxFreePayment +
      unloadingPayment +
      unloadingTaxFreePayment +
      ferryCost
    );
  }, 0);
};

const csvSalesData = yearMonthList.map((yearMonth) => {
  const monthlyData = filteredCsvData.filter(
    (row) => getYearMonth(row["発日"]) === yearMonth
  );

  const month = yearMonth.split("-")[1];

  return {
    yearMonth: yearMonth,
    month: `${Number(month)}月`,
    sales: calculateSales(monthlyData),
    expenses: calculateExpenses(monthlyData),
  };
});

const periodLabel =
  yearMonthList.length > 0
    ? `${Number(yearMonthList[0].split("-")[0])}年${Number(
        yearMonthList[0].split("-")[1]
      )}月〜${Number(
        yearMonthList[yearMonthList.length - 1].split("-")[1]
      )}月`
    : "";


const totalSales = csvSalesData.reduce(
  (sum, item) => sum + item.sales,
  0
);

const totalExpenses = csvSalesData.reduce(
  (sum, item) => sum + item.expenses,
  0
);

const grossProfit = totalSales - totalExpenses;

const grossProfitRate = (grossProfit / totalSales) * 100;

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

    const renderNavigation = () => {
    return (
      <header className="header">
        <h1>FleetPortal</h1>
        <p>北海道地区 業務管理システム</p>

        <nav>
          <button
            type="button"
            onClick={() => setCurrentPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage("calendar")}
          >
            配車表カレンダー
          </button>
        </nav>
      </header>
    );
  };

  if (currentPage === "dashboard") {
    return (
      <div className="app">
        {renderNavigation()}

        <main className="main-content">
          <section className="dashboard-section">
  
  <div className="dashboard-header">
    <h2>Sales Dashboard</h2>
    <p>売上・経費・粗利益分析</p>
  </div>

 <div className="analysis-panel">
  <h3>分析条件</h3>

  <div className="analysis-controls">
    <div className="analysis-item">
      <label htmlFor="csv-file">
        CSVファイル
      </label>

      <input
        id="csv-file"
        type="file"
        accept=".csv"
        onChange={handleCsvUpload}
      />
    </div>

    {customerList.length > 0 && (
      <div className="analysis-item">
        <label htmlFor="customer-select">
          荷主C
        </label>

        <select
  id="customer-select"
  value={selectedCustomer}
  onChange={(event) =>
    setSelectedCustomer(event.target.value)
  }
>
  <option value="all">全体</option>

  {customerList.map((customer) => (
    <option key={customer} value={customer}>
      {customer}
    </option>
  ))}
</select>
      </div>
    )}

    {csvData.length > 0 && (
      <div className="analysis-item">
        <span className="analysis-label">
          対象データ
        </span>

        <strong className="analysis-count">
          {filteredCsvData.length.toLocaleString()}件
        </strong>
      </div>
    )}
  </div>

  {csvData.length > 0 && (
    <div className="analysis-summary">
      読込データ：{csvData.length.toLocaleString()}件 ／
      選択荷主C：
{selectedCustomer === "all" ? "全体" : selectedCustomer}
    </div>
  )}
</div> 

 <div className="kpi-grid">
  <div className="kpi-card">
    <p>売上運賃</p>
    <strong>¥{totalSales.toLocaleString()}</strong>
    <p>{periodLabel}</p>
  </div>

  <div className="kpi-card">
    <p>経費合計</p>
    <strong>¥{totalExpenses.toLocaleString()}</strong>
    <p>{periodLabel}</p>
  </div>

  <div className="kpi-card">
    <p>粗利益</p>
    <strong>¥{grossProfit.toLocaleString()}</strong>
    <span>売上 − 経費</span>
  </div>

  <div className="kpi-card">
    <p>粗利率</p>
    <strong>{grossProfitRate.toFixed(1)}%</strong>
    <span>粗利益 ÷ 売上</span>
  </div>
</div>

<div className="chart-section">
  <h3>月別売上・経費推移</h3>

  <div className="chart-wrapper">
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={csvSalesData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="month" />

        <YAxis />

        <Tooltip />

        <Legend />

        <Line
          type="monotone"
          dataKey="sales"
          name="売上運賃"
          strokeWidth={3}
        />

        <Line
          type="monotone"
          dataKey="expenses"
          name="経費合計"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

<div className="sales-table-section">
  <h3>月別売上実績</h3>

  <div className="sales-table-wrapper">
    <table className="sales-table">
      <thead>
        <tr>
          <th>月</th>
          <th>売上運賃</th>
          <th>経費合計</th>
          <th>粗利益</th>
          <th>粗利率</th>
        </tr>
      </thead>

      <tbody>
        {csvSalesData.map((item) => { 
          const monthlyGrossProfit = item.sales - item.expenses;

          const monthlyGrossProfitRate =
            (monthlyGrossProfit / item.sales) * 100;

          return (
            <tr key={item.month}>
              <td>{item.month}</td>

              <td>¥{item.sales.toLocaleString()}</td>

              <td>¥{item.expenses.toLocaleString()}</td>

              <td>¥{monthlyGrossProfit.toLocaleString()}</td>

              <td>{monthlyGrossProfitRate.toFixed(1)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>

</section>
        </main>
      </div>
    );
  }

  if (selectedDocument) {
    return (
      <div className="app">
          {renderNavigation()}

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
                <td>{formatShortDate(row["乗船日"])}</td>
                <td>{row["乗船時刻"]}</td>
                <td>{row["下船地名"]}</td>
                <td>{row["着地名１"]}</td>
                <td>{formatShortDate(row["着日"])}</td>
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
                <td>{formatShortDate(row["下船日"])}</td>
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
    {renderNavigation()}

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