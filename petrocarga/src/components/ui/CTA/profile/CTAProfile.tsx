'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { UserIcon } from 'lucide-react';

import { CTA } from '../CTA';

const CTA_WIDTH = 832;
const CTA_HEIGHT = 76;
const CTA_RADIUS = 16;

const PROFILE_ICON_MOBILE = 24;
const PROFILE_ICON_SM = 32;
const PROFILE_RADIUS = 16;

export function CTAProfile() {
  const [target, setTarget] = useState({
    box: 56,
    icon: PROFILE_ICON_MOBILE,
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');

    const update = (matches: boolean) => {
      setTarget({
        box: matches ? 64 : 56,
        icon: matches
          ? PROFILE_ICON_SM
          : PROFILE_ICON_MOBILE,
      });
    };

    update(mq.matches);

    const handler = (event: MediaQueryListEvent) => {
      update(event.matches);
    };

    mq.addEventListener('change', handler);

    return () => {
      mq.removeEventListener('change', handler);
    };
  }, []);

  return (
    <CTA className="flex items-center justify-center shadow-lg" unstyled>
      <motion.div
        initial={{
          width: CTA_WIDTH,
          height: CTA_HEIGHT,
          borderRadius: CTA_RADIUS,
        }}
        animate={{
          width: target.box,
          height: target.box,
          borderRadius: PROFILE_RADIUS,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="bg-[#071D41] flex items-center justify-center"
      >
        <motion.div
          initial={{
            width: 20,
            height: 20,
            opacity: 0,
          }}
          animate={{
            width: target.icon,
            height: target.icon,
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <UserIcon className="w-full h-full text-white" />
        </motion.div>
      </motion.div>
    </CTA>
  );
}