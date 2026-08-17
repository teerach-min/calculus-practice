import type { Metadata } from 'next';
import ReferenceView from '@/components/ReferenceView';

export const metadata: Metadata = {
  title: 'สรุปสูตรและนิยาม | Pre-Calculus',
  description:
    'สรุปสูตรแคลคูลัสเบื้องต้น — ลิมิต ความต่อเนื่อง อนุพันธ์ ความชันและเส้นสัมผัส ค่าวิกฤต การอินทิเกรต และการประยุกต์ในงานวิศวกรรม',
};

export default function ReferencePage() {
  return <ReferenceView />;
}
