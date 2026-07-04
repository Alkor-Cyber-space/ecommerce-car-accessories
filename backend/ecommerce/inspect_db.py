import sqlite3, os
p='db.sqlite3'
print('DB exists:', os.path.exists(p))
conn=sqlite3.connect(p)
cur=conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
print('TABLES:')
for row in cur.fetchall():
    print(row[0])
print('---')
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%user%' ORDER BY name")
print('USER TABLES:')
for row in cur.fetchall():
    print(row[0])
print('---')
for tbl in ['auth_user','accounts_customuser','auth_group','auth_user_groups','auth_permission','auth_user_user_permissions']:
    try:
        cur.execute(f"SELECT COUNT(*) FROM {tbl}")
        print(tbl, cur.fetchone()[0])
    except Exception as e:
        print(tbl, 'ERR', e)
conn.close()
