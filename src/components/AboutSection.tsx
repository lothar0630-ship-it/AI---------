import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PersonalInfo } from '../types';

interface AboutSectionProps {
  personalInfo: PersonalInfo;
}

const AboutSection: React.FC<AboutSectionProps> = ({ personalInfo }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // YouTuber活動に関連するスキル・ツール
  const skills = [
    'ゲーム実況',
    'Vlog制作',
    '動画編集',
    'サムネイル作成',
    'ライブ配信',
    'モンスターハンター',
    'モノづくり',
    'Davinci resolve',
    'OBS Studio',
    'YouTube Analytics',
    'コミュニティ運営',
    'コンテンツ企画',
    'ストーリーテリング',
    'エンターテイメント',
    'クリエイティブ制作',
  ];

  return (
    <motion.section
      id="about"
      ref={sectionRef}
      className="py-20 bg-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      aria-labelledby="about-heading"
    >
      {/* 背景装飾要素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl"
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container-responsive relative z-10">
        {/* セクションタイトル */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h2
            id="about-heading"
            className="text-responsive-4xl md:text-responsive-5xl font-black text-primary mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.9 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            私について
          </motion.h2>
          <motion.div
            className="h-1.5 w-24 bg-primary mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: isInView ? 96 : 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </motion.div>

        {/* メインコンテンツカード */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100"
            whileHover={{
              y: -5,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* 詳細な自己紹介文 */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: isInView ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.h3
                className="text-responsive-2xl font-bold text-secondary-800 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                はじめまして、{personalInfo.name}です
              </motion.h3>

              <div className="prose prose-lg max-w-none text-secondary-700 leading-relaxed space-y-4">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  {personalInfo.description}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  私は視聴者の皆さんに楽しんでいただけるコンテンツ作りを最優先に考えています。
                  ゲーム実況では特にモンスターハンターワールドの縛りプレイを中心に、
                  挑戦的で面白い企画を心がけています。
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  動画勢Vtuberとしての活動では、毎月25日の定期投稿を継続しており、
                  モノづくりやVlogを通じて日常の楽しさや創作の過程を共有しています。
                  視聴者の方々とのコミュニケーションを大切にし、コメントには必ず目を通すようにしています。
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  現在は2つのチャンネルでそれぞれ異なるコンテンツを展開しており、
                  より多くの方に楽しんでいただけるよう、動画の品質向上と
                  新しい企画の開発に日々取り組んでいます。
                </motion.p>
              </div>
            </motion.div>

            {/* スキルセクション */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isInView ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.h3
                className="text-responsive-2xl font-bold text-secondary-800 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 1.3 }}
              >
                得意分野・使用ツール
              </motion.h3>

              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{
                      opacity: isInView ? 1 : 0,
                      scale: isInView ? 1 : 0.8,
                      y: isInView ? 0 : 20,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 1.4 + index * 0.05,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <motion.span
                      className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-responsive-sm font-semibold border border-primary/20 cursor-default focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        boxShadow:
                          '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      role="text"
                      aria-label={`得意分野: ${skill}`}
                      tabIndex={0}
                    >
                      {skill}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 追加情報セクション */}
            <motion.div
              className="mt-12 pt-8 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
                  transition={{ duration: 0.6, delay: 1.9 }}
                >
                  <h4 className="text-lg font-semibold text-secondary-800 mb-3">
                    🎯 現在の活動
                  </h4>
                  <ul className="text-secondary-600 space-y-2">
                    <motion.li
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isInView ? 1 : 0,
                        x: isInView ? 0 : -10,
                      }}
                      transition={{ duration: 0.4, delay: 2.0 }}
                    >
                      • MHWの縛りプレイ実況
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isInView ? 1 : 0,
                        x: isInView ? 0 : -10,
                      }}
                      transition={{ duration: 0.4, delay: 2.1 }}
                    >
                      • 毎月25日の定期投稿
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isInView ? 1 : 0,
                        x: isInView ? 0 : -10,
                      }}
                      transition={{ duration: 0.4, delay: 2.2 }}
                    >
                      • モノづくり・Vlogコンテンツ
                    </motion.li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 2.0 }}
                >
                  <h4 className="text-lg font-semibold text-secondary-800 mb-3">
                    💡 今後の展望
                  </h4>
                  <ul className="text-secondary-600 space-y-2">
                    <motion.li
                      initial={{ opacity: 0, x: 10 }}
                      animate={{
                        opacity: isInView ? 1 : 0,
                        x: isInView ? 0 : 10,
                      }}
                      transition={{ duration: 0.4, delay: 2.1 }}
                    >
                      • 新しいゲーム企画の開発
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: 10 }}
                      animate={{
                        opacity: isInView ? 1 : 0,
                        x: isInView ? 0 : 10,
                      }}
                      transition={{ duration: 0.4, delay: 2.2 }}
                    >
                      • 視聴者との交流強化
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: 10 }}
                      animate={{
                        opacity: isInView ? 1 : 0,
                        x: isInView ? 0 : 10,
                      }}
                      transition={{ duration: 0.4, delay: 2.3 }}
                    >
                      • コンテンツ品質の向上
                    </motion.li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AboutSection;
