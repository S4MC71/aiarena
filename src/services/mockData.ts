import type { DocumentItem, Citation } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Arena_Web_Security_Course_Syllabus_2025.pdf',
    size: '3.2 MB',
    chunksCount: 42,
    uploadedAt: 'Updated Yesterday',
    status: 'ready',
    type: 'pdf'
  },
  {
    id: 'doc-2',
    name: 'Arena_Lab_Access_and_VPN_Guide.md',
    size: '480 KB',
    chunksCount: 16,
    uploadedAt: 'Active',
    status: 'ready',
    type: 'md'
  },
  {
    id: 'doc-3',
    name: 'Class_Schedule_and_Live_Sessions.pdf',
    size: '1.1 MB',
    chunksCount: 12,
    uploadedAt: 'Active',
    status: 'ready',
    type: 'pdf'
  },
  {
    id: 'doc-4',
    name: 'Exam_CTF_and_Certification_Policy.docx',
    size: '640 KB',
    chunksCount: 14,
    uploadedAt: 'Updated this week',
    status: 'ready',
    type: 'docx'
  }
];

export interface MockRAGResult {
  content: string;
  citations: Citation[];
  isFallback: boolean;
  similarity: number;
}

export function getMockRAGResponse(query: string, _threshold: number = 0.65): MockRAGResult {
  const lowerQuery = query.toLowerCase();

  // Scenario 1: Course Syllabus / Modules / Curriculum
  if (
    lowerQuery.includes('syllabus') || 
    lowerQuery.includes('সিলেবাস') || 
    lowerQuery.includes('course') || 
    lowerQuery.includes('কোর্স') || 
    lowerQuery.includes('module') || 
    lowerQuery.includes('মডিউল') ||
    lowerQuery.includes('কি কি শেখানো')
  ) {
    return {
      similarity: 0.95,
      isFallback: false,
      citations: [],
      content: `**Arena Web Security** কোর্সের সম্পূর্ণ সিলেবাস ও মডিউল নিচে দেওয়া হলো:

### 📚 মূল কোর্স মডিউলসমূহ:
1. **Module 1: Web Fundamentals & Architecture**: HTTP/S প্রটোকল ইন্টার্নালস, Headers, Cookies, এবং Web Request-Response লাইফসাইকেল।
2. **Module 2: Reconnaissance & Attack Surface**: সাবডোমেন এনিউমারেশন, পোর্ট স্ক্যানিং এবং টেকনোলজি স্ট্যাক প্রোফাইলিং।
3. **Module 3: Broken Access Control & IDOR**: হরিজন্টাল ও ভার্টিকাল প্রিভিলেজ এস্কেলেশন এক্সপ্লয়টেশন।
4. **Module 4: Injection Attacks**: In-band, Blind ও Error-based SQL Injection এবং OS Command Injection।
5. **Module 5: Client-Side Attacks**: Reflected, Stored, DOM XSS এবং CSRF প্র্যাকটিক্যাল বাইপাস।
6. **Module 6: Server-Side Request Forgery (SSRF) & XXE**: ক্লাউড মেটাডাটা এক্সট্রাকশন এবং XML এক্সপ্লয়টেশন।
7. **Module 7: Authentication & JWT Flaws**: ব্রুটফোর্স প্রতিরোধ বাইপাস এবং JWT সিকিউরিটি অ্যানালাইসিস।
8. **Module 8: API Security & Final Capstone CTF**: REST API ভালনারেবিলিটি অ্যাসেসমেন্ট ও লাইভ চ্যালেঞ্জ।

### 🛠️ প্র্যাকটিক্যাল টুলস:
* **Burp Suite Pro**, SQLmap, OWASP ZAP, Postman, Nmap এবং কাস্টম পাইথন স্ক্রিপ্ট তৈরি।`
    };
  }

  // Scenario 2: Lab Access / VPN / OpenVPN / Target Machine
  if (
    lowerQuery.includes('lab') || 
    lowerQuery.includes('ল্যাব') || 
    lowerQuery.includes('vpn') || 
    lowerQuery.includes('ভিপিএন') || 
    lowerQuery.includes('connect') || 
    lowerQuery.includes('openvpn') ||
    lowerQuery.includes('ip') ||
    lowerQuery.includes('target')
  ) {
    return {
      similarity: 0.94,
      isFallback: false,
      citations: [],
      content: `**Arena Practice Lab**-এ যুক্ত হওয়ার নিয়ম নিচে দেওয়া হলো:

### 🔌 VPN কানেকশন স্টেপস (Kali Linux / Ubuntu):
1. **VPN ফাইল ডাউনলোড**: Student Portal ড্যাশবোর্ডে গিয়ে **Download VPN Config** থেকে \`arena-student.ovpn\` ফাইলটি ডাউনলোড করুন।
2. **টার্মিনাল থেকে রান করুন**:
\`\`\`bash
# OpenVPN দিয়ে কানেক্ট করার কমান্ড
sudo openvpn --config arena-student.ovpn
\`\`\`
3. **কানেকশন ভেরিফিকেশন**: টার্মিনালে \`Initialization Sequence Completed\` দেখার পর আরেকটি ট্যাবে পিং টেস্ট করুন:
\`\`\`bash
ping -c 3 10.10.10.1
\`\`\`
সফল হলে আপনার সিস্টেম সরাসরি এরিনার ডেডিকেটেড ল্যাব নেটওয়ার্কে যুক্ত হয়ে যাবে।

### ⚠️ গুরুত্বপূর্ণ ল্যাব নিয়ম:
* ল্যাব টার্গেট মেশিনগুলো প্রতি **২ ঘণ্টা পর পর অটো-রিসেট** হয়।
* কোনো টার্গেট আইপি রেসপন্স না করলে পোর্টাল ড্যাশবোর্ড থেকে **"Reset Instance"** বাটনে ক্লিক করে নতুন ক্লিন মেশিন চালু করতে পারবেন।`
    };
  }

  // Scenario 3: Class Schedule / Live Sessions / Recording
  if (
    lowerQuery.includes('class') || 
    lowerQuery.includes('ক্লাস') || 
    lowerQuery.includes('schedule') || 
    lowerQuery.includes('সময়') || 
    lowerQuery.includes('time') || 
    lowerQuery.includes('recording') ||
    lowerQuery.includes('রেকর্ডিং') ||
    lowerQuery.includes('লাইভ')
  ) {
    return {
      similarity: 0.91,
      isFallback: false,
      citations: [],
      content: `**Arena Web Security**-এর লাইভ ক্লাস এবং রেকর্ডিং সংক্রান্ত নিয়মাবলী:

### 📅 লাইভ ক্লাসের রুটিন:
* **ক্লাসের দিন**: প্রতি **মঙ্গলবার** এবং **শুক্রবার**।
* **সময়**: রাত **৯:০০ টা** (বাংলাদেশ সময়, GMT+6)।
* **প্ল্যাটফর্ম**: Zoom Live (Discord চ্যানেলে ক্লাসের ৩০ মিনিট আগে লিংক শেয়ার করা হয়)।

### 🎥 ক্লাস রেকর্ডিং ও সাপোর্ট:
* লাইভ ক্লাস শেষ হওয়ার **৬ ঘণ্টার মধ্যে** স্টুডেন্ট পোর্টালে ফুল HD রেকর্ডিং ও লেকচার নোটস আপলোড করা হয় (লাইফটাইম অ্যাক্সেস)।
* **মেন্টর সাপোর্ট সেশন**: প্রতি **রবিবার রাত ৮:০০ টা থেকে ১০:০০ টা** পর্যন্ত ডিসকর্ডে সরাসরি প্র্যাকটিস সমস্যা সমাধানের বিশেষ সেশন থাকে।`
    };
  }

  // Scenario 4: Technical Cybersecurity question (SQLi vs XSS, etc.)
  if (
    lowerQuery.includes('sqli') || 
    lowerQuery.includes('sql injection') || 
    lowerQuery.includes('xss') || 
    lowerQuery.includes('cross-site') || 
    lowerQuery.includes('idor') || 
    lowerQuery.includes('csrf') ||
    lowerQuery.includes('burp')
  ) {
    return {
      similarity: 0.92,
      isFallback: false,
      citations: [],
      content: `SQL Injection এবং XSS-এর মূল পার্থক্য নিচে তুলে ধরা হলো:

### 1. SQL Injection (SQLi) - সার্ভার-সাইড ভালনারেবিলিটি
* **টার্গেট**: ব্যাকএন্ড ডাটাবেজ (MySQL, PostgreSQL, Oracle)।
* **প্রভাব**: পুরো ডাটাবেজের তথ্য দেখা, ইউজার অথেন্টিকেশন বাইপাস এবং ডাটাবেজের টেবিল মোছা বা পরিবর্তন করা।
* **প্রতিরোধ**: **Prepared Statements (Parameterized Queries)** এবং ORM ব্যবহার করা।

### 2. Cross-Site Scripting (XSS) - ক্লায়েন্ট-সাইড ভালনারেবিলিটি
* **টার্গেট**: সাধারণ ইউজার বা ভিকটিমের ওয়েব ব্রাউজার।
* **প্রভাব**: সেশন কুকি হাইজ্যাক করা, ব্রাউজারে ক্ষতিকারক স্ক্রিপ্ট রান করানো বা রিডাইরেক্ট করা।
* **প্রতিরোধ**: Context-aware Output Encoding এবং স্ট্রং **Content Security Policy (CSP)** পলিসি বাস্তবায়ন করা।`
    };
  }

  // Scenario 5: Fallback Router (Questions unrelated to Arena CyberSec)
  return {
    similarity: 0.38,
    isFallback: true,
    citations: [],
    content: `আপনার প্রশ্ন: **"${query}"**

Arena Web Security-এর নলেজ বেসে এই বিষয়ের উপর কোনো তথ্য নেই। 

আপনি যদি কোর্স সিলেবাস, ক্লাস শিডিউল, ল্যাব VPN কানেকশন বা সাইবার সিকিউরিটি টপিক নিয়ে কোনো কিছু জানতে চান, তবে সরাসরি জিজ্ঞাসা করতে পারেন!`
  };
}
