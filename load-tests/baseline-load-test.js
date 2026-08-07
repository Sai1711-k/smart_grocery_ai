const autocannon = require('autocannon');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const TARGET_URL = process.env.TARGET_URL || 'https://smart-grocery-ai-beige.vercel.app/api/products';
const CONNECTIONS = parseInt(process.env.CONNECTIONS || '100', 10);
const DURATION = parseInt(process.env.DURATION || '60', 10); // 60 seconds (1 minute)
const REPORT_OUTPUT_PATH = path.join(__dirname, 'Baseline_Load_Test_Report.xlsx');

console.log('================================================================');
console.log('🚀 SMART GROCERY AI - API BASELINE & LOAD TESTING SUITE');
console.log('================================================================');
console.log(`🎯 Target API URL     : ${TARGET_URL}`);
console.log(`👥 Virtual Users (VU) : ${CONNECTIONS} concurrent connections`);
console.log(`⏱️ Duration            : ${DURATION} seconds (1 minute)`);
console.log(`📊 Report Destination : ${REPORT_OUTPUT_PATH}`);
console.log('================================================================\n');

console.log(`⏳ Starting Load Test with ${CONNECTIONS} virtual users for ${DURATION}s...`);

const instance = autocannon({
  url: TARGET_URL,
  connections: CONNECTIONS,
  duration: DURATION,
  pipelining: 1,
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Autocannon Baseline Load Tester 1.0'
  }
}, (err, result) => {
  if (err) {
    console.error('❌ Error executing load test:', err);
    process.exit(1);
  }

  // Process & Extract Load Test Metrics
  const totalRequests = result.requests.total;
  const rpsAvg = result.requests.average.toFixed(2);
  const rpsMax = result.requests.max;
  const rpsMin = result.requests.min;

  const latencyAvg = result.latency.average.toFixed(2);
  const latencyMin = result.latency.min;
  const latencyMax = result.latency.max;
  const latencyP50 = result.latency.p50 || result.latency.p50_0;
  const latencyP90 = result.latency.p90 || result.latency.p90_0;
  const latencyP99 = result.latency.p99 || result.latency.p99_0;

  const total2xx = result['2xx'] || 0;
  const totalErrors = result.errors || 0;
  const totalTimeouts = result.timeouts || 0;
  const throughputMbSec = (result.throughput.average / (1024 * 1024)).toFixed(2);
  const successRate = totalRequests > 0 ? ((total2xx / totalRequests) * 100).toFixed(2) + '%' : '0%';

  console.log('\n================================================================');
  console.log('📊 BASELINE LOAD TEST EXECUTION RESULTS');
  console.log('================================================================');
  console.log(` 👥 Virtual Users (VU)      : ${CONNECTIONS}`);
  console.log(` ⏱️ Test Duration            : ${DURATION} seconds`);
  console.log(` 🚀 Total Requests Sent      : ${totalRequests.toLocaleString()}`);
  console.log(` ⚡ Requests Per Second (RPS): ${rpsAvg} req/sec (Peak: ${rpsMax})`);
  console.log(` 📈 Success Rate (200 OK)    : ${successRate} (${total2xx.toLocaleString()} passed)`);
  console.log(` ❌ Errors / Timeouts        : ${totalErrors} errors, ${totalTimeouts} timeouts`);
  console.log(` 💾 Throughput               : ${throughputMbSec} MB/sec`);
  console.log('----------------------------------------------------------------');
  console.log(' ⏱️ RESPONSE TIME (LATENCY) METRICS:');
  console.log(`    • Min Response Time      : ${latencyMin} ms`);
  console.log(`    • Average Response Time  : ${latencyAvg} ms`);
  console.log(`    • Max Response Time      : ${latencyMax} ms`);
  console.log(`    • 50th Percentile (p50)  : ${latencyP50} ms`);
  console.log(`    • 90th Percentile (p90)  : ${latencyP90} ms`);
  console.log(`    • 99th Percentile (p99)  : ${latencyP99} ms`);
  console.log('================================================================\n');

  // --- GENERATE EXCEL REPORT ---
  console.log('📑 Generating Baseline Load Test Excel Report...');

  const workbook = XLSX.utils.book_new();

  // Sheet 1: Executive Load Test Summary
  const summarySheetData = [
    { 'Metric': 'Target Application API', 'Value': TARGET_URL },
    { 'Metric': 'Load Test Type', 'Value': 'Baseline Concurrent Load Test' },
    { 'Metric': 'Virtual Users (Concurrent Connections)', 'Value': CONNECTIONS },
    { 'Metric': 'Test Duration (Seconds)', 'Value': DURATION },
    { 'Metric': 'Total Requests Executed', 'Value': totalRequests },
    { 'Metric': 'Requests Per Second (Average RPS)', 'Value': `${rpsAvg} req/sec` },
    { 'Metric': 'Peak Requests Per Second (Max RPS)', 'Value': `${rpsMax} req/sec` },
    { 'Metric': 'Average Response Time (Avg Latency)', 'Value': `${latencyAvg} ms` },
    { 'Metric': 'Minimum Response Time (Min Latency)', 'Value': `${latencyMin} ms` },
    { 'Metric': 'Maximum Response Time (Max Latency)', 'Value': `${latencyMax} ms` },
    { 'Metric': '90th Percentile Response Time (p90)', 'Value': `${latencyP90} ms` },
    { 'Metric': '99th Percentile Response Time (p99)', 'Value': `${latencyP99} ms` },
    { 'Metric': 'Successful 200 OK Responses', 'Value': total2xx },
    { 'Metric': 'Failed Requests / Errors', 'Value': totalErrors },
    { 'Metric': 'Timeout Count', 'Value': totalTimeouts },
    { 'Metric': 'Overall Success Rate (%)', 'Value': successRate },
    { 'Metric': 'Data Throughput Rate', 'Value': `${throughputMbSec} MB/sec` },
    { 'Metric': 'Execution Date & Timestamp', 'Value': new Date().toLocaleString() }
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summarySheetData);
  summarySheet['!cols'] = [{ wch: 38 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Load Test Summary');

  // Sheet 2: Latency & RPS Distribution Breakdown
  const distributionData = [
    { 'Percentile / Metric': 'Minimum Latency', 'Response Time (ms)': `${latencyMin} ms`, 'Description': 'Fastest response time recorded' },
    { 'Percentile / Metric': '50th Percentile (p50)', 'Response Time (ms)': `${latencyP50} ms`, 'Description': '50% of requests responded under this time' },
    { 'Percentile / Metric': 'Average Latency', 'Response Time (ms)': `${latencyAvg} ms`, 'Description': 'Mean response time across all virtual users' },
    { 'Percentile / Metric': '90th Percentile (p90)', 'Response Time (ms)': `${latencyP90} ms`, 'Description': '90% of requests responded under this time' },
    { 'Percentile / Metric': '99th Percentile (p99)', 'Response Time (ms)': `${latencyP99} ms`, 'Description': '99% of requests responded under this time' },
    { 'Percentile / Metric': 'Maximum Latency', 'Response Time (ms)': `${latencyMax} ms`, 'Description': 'Slowest response time recorded (worst case)' }
  ];

  const distributionSheet = XLSX.utils.json_to_sheet(distributionData);
  distributionSheet['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Latency Percentiles');

  // Write Excel file
  XLSX.writeFile(workbook, REPORT_OUTPUT_PATH);

  console.log(`🎉 SUCCESS! Baseline Load Test Report saved to:\n   👉 ${REPORT_OUTPUT_PATH}\n`);
  process.exit(0);
});

// Stream progress in real-time
autocannon.track(instance, { renderProgressBar: false, renderResultsTable: false });
