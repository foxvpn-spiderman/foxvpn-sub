const axios = require('axios');
const fs = require('fs');

const customers = {
    "main":   "https://liangxin.xyz/api/v1/liangxin?OwO=116e49c7abce992495496077aaec9ee1",
    "khach2": "https://liangxin.xyz/api/v1/liangxin?OwO=bf0333e5933861705f424388b634d771",
};

async function processCustomer(id) {
    const url = customers[id];
    if (!url) {
        console.error(`❌ Không tìm thấy ID: ${id}`);
        process.exit(1);
    }

    console.log(`📥 Đang lấy subscription cho ${id}...`);

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'ClashMeta' },
            timeout: 30000
        });

        let content = response.data.trim();
        if (!content.includes('://')) {
            content = Buffer.from(content, 'base64').toString('utf-8');
        }

        let lines = content.split('\n').filter(line => line.trim() !== '');

        lines = lines.map(line => {
            if (!line.includes('#')) return line;

            let [link, name = "Node"] = line.split('#', 2);
            name = name.trim();

            name = name.replace(/\|BGP\|流媒体|\|流媒体|\|BGP\|CTCU|\|BGP\|CUCM|\|CTCU|\|CUCM|\|Relay|\|Backup|\|Test/g, '');

            name = name
                .replace(/日本高速|日本专线|日本|JP|Japan/gi, "🇯🇵 JP")
                .replace(/美国|USA|US|America/gi, "🇺🇸 US")
                .replace(/香港|HK|HongKong/gi, "🇭🇰 HK")
                .replace(/新加坡|SG|Singapore/gi, "🇸🇬 SG")
                .replace(/台湾|TW|Taiwan/gi, "🇹🇼 TW")
                .replace(/韩国|KR|Korea/gi, "🇰🇷 KR")
                .replace(/英国|UK|GB/gi, "🇬🇧 UK")
                .replace(/\%[0-9A-Fa-f]{2}/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (!/🇯🇵|🇺🇸|🇭🇰|🇸🇬|🇹🇼|🇰🇷|🇬🇧/.test(name)) {
                if (/jp|日本/i.test(name)) name = "🇯🇵 JP " + name;
                else if (/us|美国/i.test(name)) name = "🇺🇸 US " + name;
                else if (/hk|香港/i.test(name)) name = "🇭🇰 HK " + name;
                else if (/sg|新加坡/i.test(name)) name = "🇸🇬 SG " + name;
                else name = "🚀 " + name;
            }

            return link + "#" + name;
        });

        fs.writeFileSync(`sub-${id}.txt`, lines.join('\n'));
        console.log(`✅ Hoàn thành ${id} - ${lines.length} nodes`);

    } catch (error) {
        console.error(`❌ Lỗi khi xử lý ${id}:`, error.message);
        process.exit(1);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const customerId = args[0] || "main";
    await processCustomer(customerId);
}

main();
