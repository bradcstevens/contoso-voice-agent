import './globals.css'
import type { Metadata } from "next";
import { version } from '@/store/version';
import styles from './layout.module.css';
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';



export const metadata: Metadata = {
  title: "Contoso Outdoors",
  description:
    "Embrace Adventure with Contoso Outdoors - Your Ultimate Partner in Exploring the Unseen!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
        {children}
        
        <div className={styles.version}>{version}</div>
      </body>
    </html>
  );
}
