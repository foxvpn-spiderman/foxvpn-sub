const axios = require('axios');
const fs = require('fs');

async function main() {
    const subUrl = process.env.SUB_URL;
    if (!subUrl) {
        console.error("❌ SUB_URL secret chưa được thiết lập!");
        process.exit(1);
    }

    console.log("📥 Đang lấy subscription từ LiangXin...");

    try {
        const response = await axios.get(subUrl, {
            headers: { 'User-Agent': 'ClashMeta' },
            timeout: 30000
        });

        let content = response.data.trim();

        // Decode Base64 nếu cần
        if (!content.includes('://')) {
            content = Buffer.from(content, 'base64').toString('utf-8');
        }

        let lines = content.split('\n').filter(line => line.trim() !== '');

        console.log(`🔄 Đang xử lý ${lines.length} nodes...`);

        lines = lines.map(line => {
            if (!line.includes('#')) return line;

            let [link, name = "Node"] = line.split('#', 2);
            name = name.trim();

            // Xóa tag thừa mạnh
            name = name
                .replace(/\|BGP\|流媒体/g, '')
                .replace(/\|流媒体/g, '')
                .replace(/\|BGP\|CTCU/g, '')
                .replace(/\|BGP\|CUCM/g, '')
                .replace(/\|CTCU/g, '')
                .replace(/\|CUCM/g, '')
                .replace(/\|Relay/g, '')
                .replace(/\|Backup/g, '')
                .replace(/\|Test/g, '')
                .replace(/\|0\.1x/g, '')
                .replace(/[\[\]\(\)]/g, ' ');

            // Thay tên node theo kiểu đẹp
            name = name
                .replace(/日本高速|日本专线|日本|JP|Japan/gi, "🇯🇵 JP")
                .replace(/美国|USA|US|America/gi, "🇺🇸 US")
                .replace(/香港|HK|HongKong|Hong Kong/gi, "🇭🇰 HK")
                .replace(/新加坡|SG|Singapore/gi, "🇸🇬 SG")
                .replace(/台湾|TW|Taiwan/gi, "🇹🇼 TW")
                .replace(/韩国|KR|Korea/gi, "🇰🇷 KR")
                .replace(/英国|UK|GB|United Kingdom/gi, "🇬🇧 UK");

            // Làm sạch tên
            name = name
                .replace(/\%[0-9A-Fa-f]{2}/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // Thêm flag nếu chưa có
            if (!/🇯🇵|🇺🇸|🇭🇰|🇸🇬|🇹🇼|🇰🇷|🇬🇧/.test(name)) {
                if (/jp|日本|japan/i.test(name)) name = "🇯🇵 JP " + name.replace(/jp|日本|japan/i, '').trim();
                else if (/us|美国|usa|america/i.test(name)) name = "🇺🇸 US " + name.replace(/us|美国|usa|america/i, '').trim();
                else if (/hk|香港|hongkong/i.test(name)) name = "🇭🇰 HK " + name.replace(/hk|香港|hongkong/i, '').trim();
                else if (/sg|新加坡|singapore/i.test(name)) name = "🇸🇬 SG " + name.replace(/sg|新加坡|singapore/i, '').trim();
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
