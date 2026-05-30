const axios = require('axios');
const fs = require('fs');

async function main() {
    const subUrl = process.env.SUB_URL;
    if (!subUrl) {
        console.error("❌ SUB_URL secret chưa được thiết lập!");
        process.exit(1);
    }

    console.log("📥 Đang lấy subscription...");

    try {
        const response = await axios.get(subUrl, {
            headers: { 'User-Agent': 'ClashMeta' },
            timeout: 30000
        });

        let content = response.data.trim();

        if (!content.includes('://')) {
            content = Buffer.from(content, 'base64').toString('utf-8');
        }

        let lines = content.split('\n').filter(line => line.trim() !== '');

        console.log(`🔄 Đang xử lý ${lines.length} nodes...`);

        const junkRegex = [/\|BGP\|流媒体/g, /\|流媒体/g, /\|BGP\|CTCU/g, /\|BGP\|CUCM/g, /\|CTCU/g, /\|CUCM/g, /\|Relay/g, /\|Backup/g, /\|Test/g];

        lines = lines.map(line => {
            if (!line.includes('#')) return line;

            let [link, name = "Node"] = line.split('#', 2);
            name = name.trim();

            junkRegex.forEach(regex => name = name.replace(regex, ''));

            name = name
                .replace(/日本高速|日本专线|日本|JP/gi, "🇯🇵 JP")
                .replace(/美国|USA|US/gi, "🇺🇸 US")
                .replace(/香港|HK/gi, "🇭🇰 HK")
                .replace(/新加坡|SG/gi, "🇸🇬 SG")
                .replace(/台湾|TW/gi, "🇹🇼 TW")
                .replace(/韩国|KR/gi, "🇰🇷 KR")
                .replace(/英国|UK|GB/gi, "🇬🇧 UK")
                .replace(/\%[0-9A-Fa-f]{2}/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (!/🇯🇵|🇺🇸|🇭🇰|🇸🇬|🇹🇼|🇰🇷|🇬🇧/.test(name)) {
                if (/jp|日本/i.test(name)) name = "🇯🇵 " + name;
                else if (/us|美国/i.test(name)) name = "🇺🇸 " + name;
                else if (/hk|香港/i.test(name)) name = "🇭🇰 " + name;
                else if (/sg|新加坡/i.test(name)) name = "🇸🇬 " + name;
                else name = "🚀 " + name;
            }

            return link + "#" + name;
        });

        fs.writeFileSync('sub.txt', lines.join('\n'));
        console.log(`✅ Hoàn thành! Đã xử lý ${lines.length} nodes.`);

    } catch (error) {
        console.error("❌ Lỗi:", error.message);
        process.exit(1);
    }
}

main();
