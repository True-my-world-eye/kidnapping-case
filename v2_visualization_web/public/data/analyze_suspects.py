import pandas as pd
from collections import Counter
import re

# File paths
employee_file = r"d:\数据可视化清晰版\数据整理(1)\数据整理\v2_visualization_web\public\data\employee_nodes.csv"
emails_file = r"d:\数据可视化清晰版\数据整理(1)\数据整理\v2_visualization_web\public\data\emails.csv"
edges_file = r"d:\数据可视化清晰版\数据整理(1)\数据整理\v2_visualization_web\public\data\network_edges.csv"

# Load data
employees = pd.read_csv(employee_file)
emails = pd.read_csv(emails_file)
edges = pd.read_csv(edges_file)

# Target surnames
target_surnames = ['Vann', 'Bodrogi', 'Lagos']

# 1. Find employees
target_employees = employees[employees['last_name'].isin(target_surnames)]

print("=== 目标员工信息 (Vann, Bodrogi, Lagos) ===")
suspect_names = target_employees['name'].tolist()
suspect_emails = target_employees['email'].dropna().tolist()

for _, row in target_employees.iterrows():
    print(f"姓名: {row['name']} (Email: {row['email']})")
    print(f"部门: {row['department']} | 职位: {row['position']}")
    print(f"背景: 出生于 {row['birth_country']}, 国籍 {row['citizenship_country']}")
    print(f"军事背景: {row['military_service_branch']} - {row['military_discharge_type']}")
    print(f"上级: {row['reports_to']}")
    print("-" * 40)

# 2. Email Analysis
print("\n=== 关键联系人与异常邮件线索 ===")
for name in suspect_names:
    email_addr = target_employees[target_employees['name'] == name]['email'].values[0]
    
    # Sent emails
    sent_emails = emails[emails['from_email'] == email_addr]
    # Received emails
    received_emails = emails[emails['to_emails'].str.contains(email_addr, na=False)]
    
    print(f"\n--- {name} 的邮件活动 ---")
    print(f"发送数量: {len(sent_emails)} | 接收数量: {len(received_emails)}")
    
    # Key contacts (To)
    contacts = []
    for to_names in sent_emails['to_names'].dropna():
        contacts.extend([n.strip() for n in to_names.split(';')])
    
    # Remove self
    contacts = [c for c in contacts if c != name]
    contact_counts = Counter(contacts).most_common(5)
    print(f"最频繁的发送对象: {contact_counts}")
    
    # Check for suspicious topics or subjects
    suspicious_keywords = ['confidential', 'secret', 'urgent', 'meeting', 'pok', 'armed', 'kidnap', 'vip', 'kronos', 'tethys']
    suspicious_emails = sent_emails[sent_emails['subject'].str.lower().str.contains('|'.join(suspicious_keywords), na=False)]
    if not suspicious_emails.empty:
        print(f"可疑/敏感邮件主题 (发送):")
        for _, row in suspicious_emails.head(5).iterrows():
            print(f"  - [{row['date']}] {row['subject']} (To: {row['to_names']})")
            
    # Outside working hours (assuming 8:00-18:00 is normal)
    if 'date' in sent_emails.columns:
        sent_emails['date'] = pd.to_datetime(sent_emails['date'])
        off_hours = sent_emails[(sent_emails['date'].dt.hour < 8) | (sent_emails['date'].dt.hour >= 19)]
        if not off_hours.empty:
            print(f"非工作时间发送邮件数量: {len(off_hours)}")

# 3. Network Edges Analysis
print("\n=== 网络关系异常线索 ===")
for name in suspect_names:
    related_edges = edges[(edges['source_label'] == name) | (edges['target_label'] == name)]
    if not related_edges.empty:
        print(f"\n--- {name} 的实体关系网络 ---")
        for _, row in related_edges.iterrows():
            other_node = row['target_label'] if row['source_label'] == name else row['source_label']
            print(f"关系: {name} <-> {other_node} | 类型: {row['relation_type']} | 证据: {row['description']} ({row['date']})")
    else:
        print(f"\n--- {name} 在事件网络中无特殊关联记录 ---")
