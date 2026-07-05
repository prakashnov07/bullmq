const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'nbuser',
        database: 'schoolapp'
    });
    
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM receiptdetails WHERE receiptid IN (1553, 1554) AND branchid = "school"'
        );
        console.log('receiptdetails rows:', JSON.stringify(rows, null, 2));
        
        const [ownerRows] = await connection.execute(
            'SELECT * FROM receiptowner WHERE receiptid IN (1553, 1554) AND branchid = "school"'
        );
        console.log('receiptowner rows:', JSON.stringify(ownerRows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

main();
