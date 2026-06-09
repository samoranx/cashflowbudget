// Parses the Standard Bank CSV export (semicolon-delimited, BOM-prefixed)
// Expected columns: Id;Date;Description;Account;SpendingGroup;Category;PayMonth;Amount;BankAccountId

function classifyCategory(description, amount) {
  const d = description.toLowerCase();
  if (amount > 0) {
    if (
      d.includes('salary') || d.includes('credit transfer') ||
      d.includes('electronic banking payment') || d.includes('bolsa third party') ||
      d.includes('real time transfer') || d.includes('magtape credit') ||
      d.includes('closing transaction') || d.includes('bond repayment canc') ||
      d.includes('interest adjustment') || d.includes('ib payment from') ||
      d.includes('payshap payment from') || d.includes('ib transfer from') ||
      d.includes('rtd-no authority')
    ) return 'Income';
  }
  if (
    d.includes('bond repayment') || d.includes('home loan') ||
    d.includes('sbsa hl') || d.includes('sbib-mobi') ||
    d.includes('silveroaks') || d.includes('insurhop') ||
    d.includes('avbob') || d.includes('hollardpfs') ||
    (d.includes('liberty') && d.includes('insurance'))
  ) return 'Insurance & Loans';
  if (d.includes('blue hills') || d.includes('3 rivers') || d.includes('piano')) return 'Education';
  if (d.includes('liebetrau') || d.includes('thatcher home') || d.includes('nursing home')) return 'Rent & Housing';
  if (
    d.includes('engen') || d.includes('sasol') || d.includes('total') ||
    d.includes('shell') || d.includes('caltex') || d.includes('petroport') ||
    d.includes('bp m2') || d.includes('tapngo') || d.includes('tapn go') ||
    d.includes('grasmere') || d.includes('n3 de hoek') || d.includes('buraq')
  ) return 'Fuel';
  if (
    d.includes('checkers') || d.includes('pnp') || d.includes('pick n pay') ||
    d.includes('woolworths') || d.includes('shoprite') || d.includes('superspar') ||
    d.includes('kwikspar') || d.includes('spar ') || d.includes('boxer') ||
    d.includes('jumbo') || d.includes('clicks') || d.includes('dischem') ||
    d.includes('afgri') || d.includes('oasis mini') || d.includes('joko') ||
    d.includes('tdf quality') || d.includes('don amare')
  ) return 'Groceries';
  if (
    d.includes('electricity') || d.includes('afrihost') || d.includes('mweb') ||
    d.includes('telkom') || d.includes('tracker') || d.includes('netstar') ||
    d.includes('ucount') || d.includes('multichoice') || d.includes('moment payco') ||
    d.includes('asset guarding') || d.includes('storage')
  ) return 'Utilities';
  if (
    d.includes('propshaft') || d.includes('autolot') || d.includes('goldwagen') ||
    d.includes('chotia') || d.includes('chothia') || d.includes('lindo') ||
    d.includes('tyremart') || d.includes('hi performanc') || d.includes('less auto') ||
    d.includes('gr landmark') || d.includes('megaworth') || d.includes('ntt volkswa') ||
    d.includes('jakes') || d.includes('jada') || d.includes('icr auto') ||
    d.includes('specsavers') || d.includes('dr f j') || d.includes('drs cj') ||
    d.includes('nitedoc') || d.includes('mikka') || d.includes('autobank') ||
    d.includes('mikka hardwar')
  ) return 'Car & Repairs';
  if (
    d.includes('kfc') || d.includes('nandos') || d.includes('romans pizza') ||
    d.includes('roman s pizza') || d.includes('fishaways') || d.includes('wimpy') ||
    d.includes('steers') || d.includes('debonairs') || d.includes('mcd ') ||
    d.includes('kauai') || d.includes('take a break') || d.includes('grace and mer') ||
    d.includes('spring sweet') || d.includes('family table') || d.includes('raya') ||
    d.includes('csb fort') || d.includes('csg foods') || d.includes('tsebo') ||
    d.includes('ndumela') || d.includes('yoco') || d.includes('csb ') ||
    d.includes('in house supp') || d.includes('bergsig') || d.includes('rensburg mini')
  ) return 'Food & Dining';
  if (
    d.includes('samora') || d.includes('sandiso') || d.includes('savuya') ||
    d.includes('zenande') || d.includes('siyanda') || d.includes('nesta') ||
    d.includes('nthabiseng') || d.includes('mfundo') || d.includes('lesotho') ||
    d.includes('ntsiki') || d.includes('bura') || d.includes('kumkani') ||
    d.includes('victor aquantum') || d.includes('thatcher') || d.includes('derick') ||
    d.includes('rushil') || d.includes('tshepo')
  ) return 'Family & Transfers';
  if (
    d.includes('takealot') || d.includes('power fashion') || d.includes('jet ') ||
    d.includes('forever kidz') || d.includes('h&m') || d.includes('mrprice') ||
    d.includes('exact ') || d.includes('hpy*samsung') || d.includes('interjewel') ||
    d.includes('s#forever') || d.includes('khasonathi')
  ) return 'Shopping';
  if (
    d.includes('payback loan') || d.includes('samora loan') || d.includes('loan pay') ||
    d.includes('nudebt')
  ) return 'Loan Repayments';
  if (
    d.includes('prepaid mobile') || d.includes('cellphone') || d.includes('instant money') ||
    d.includes('payshap') || d.includes('fee:') || d.includes('fee -') ||
    d.includes('honouring fee') || d.includes('excess interest') || d.includes('service fee') ||
    d.includes('monthly fee') || d.includes('overdraft') || d.includes('pos declined') ||
    d.includes('telephone account') || d.includes('membership fee') ||
    d.includes('immediate payment') || d.includes('90 day statement')
  ) return 'Fees & Airtime';
  if (
    d.includes('autobank cash') || d.includes('cash with')
  ) return 'Cash Withdrawals';
  if (
    d.includes('electricity') || d.includes('lesedi local') || d.includes('midvaal') ||
    d.includes('municipality')
  ) return 'Utilities';
  return 'Other';
}

function detectRecurring(description) {
  const d = description.toLowerCase();
  return (
    d.includes('insurance premium') || d.includes('bond repayment') ||
    d.includes('debicheck') || d.includes('sbsa hl') || d.includes('sbib-mobi') ||
    d.includes('debit transfer afrihost') || d.includes('debit transfer mweb') ||
    d.includes('service agreement tracker') || d.includes('account payment netstar') ||
    d.includes('membership fee ucount') || d.includes('fixed monthly fee') ||
    d.includes('service agreement mweb') || d.includes('telephone account telkom') ||
    d.includes('silveroaks') || d.includes('moment payco') ||
    d.includes('asset guarding') || d.includes('overdraft service fee') ||
    d.includes('avbob') || d.includes('sbib-insurhop')
  );
}

export function parseStandardBankCSV(csvText) {
  // Strip BOM
  const clean = csvText.replace(/^﻿/, '').replace(/^ï»¿/, '');
  const lines = clean.split(/\r?\n/).filter(l => l.trim());

  if (lines.length < 2) return [];

  // Detect header
  const header = lines[0].split(';').map(h => h.trim().toLowerCase());
  const col = name => header.indexOf(name);

  const idCol = col('id');
  const dateCol = col('date');
  const descCol = col('description');
  const payMonthCol = col('paymonth');
  const amountCol = col('amount');

  // Fallback column indices if header not found
  const getField = (row, idx, fallback = '') =>
    idx >= 0 ? (row[idx] ?? fallback) : fallback;

  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    if (parts.length < 4) continue;

    const rawAmount = parseFloat(getField(parts, amountCol, '0').replace(',', '.'));
    if (isNaN(rawAmount)) continue;

    const rawDate = getField(parts, dateCol, '').trim();
    // Date format: "2026-06-09 00:00:00.0000000" → "2026-06-09"
    const date = rawDate.split(' ')[0];

    const description = getField(parts, descCol, '').trim();
    const payMonth = getField(parts, payMonthCol, '').trim();
    const id = parseInt(getField(parts, idCol, String(i)), 10) || i;

    if (!date || !description || !payMonth) continue;

    const isRecurring = detectRecurring(description);
    const type = rawAmount > 0 ? 'Income' : 'Expense';
    const category = classifyCategory(description, rawAmount);

    transactions.push({ id, date, description, payMonth, amount: rawAmount, isRecurring, type, category });
  }

  return transactions;
}

export function extractPayMonths(transactions) {
  const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seen = new Set(transactions.map(t => t.payMonth));
  return [...seen].sort((a, b) => {
    const [am, ay] = a.split('-');
    const [bm, by] = b.split('-');
    const ay2 = parseInt(ay, 10);
    const by2 = parseInt(by, 10);
    if (ay2 !== by2) return ay2 - by2;
    return order.indexOf(am) - order.indexOf(bm);
  });
}
