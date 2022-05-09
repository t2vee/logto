import { MDXProvider } from '@mdx-js/react';
import i18next from 'i18next';
import { MDXProps } from 'mdx/types';
import React, { cloneElement, lazy, LazyExoticComponent, Suspense, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import Modal from 'react-modal';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import CodeEditor from '@/components/CodeEditor';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import Close from '@/icons/Close';
import * as modalStyles from '@/scss/modal.module.scss';
import { SupportedJavascriptLibraries } from '@/types/applications';
import { GuideForm } from '@/types/guide';

import LibrarySelector from '../LibrarySelector';
import * as styles from './index.module.scss';

type Props = {
  appName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: GuideForm) => Promise<void>;
};

const Guides: Record<string, LazyExoticComponent<(props: MDXProps) => JSX.Element>> = {
  react: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/react.mdx')),
  'react_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/react_zh-cn.mdx')),
};

const onClickFetchSampleProject = (projectName: string) => {
  const sampleUrl = `https://github.com/logto-io/js/tree/master/packages/${projectName}-sample`;
  window.open(sampleUrl, '_blank');
};

const GuideModal = ({ appName, isOpen, onClose, onComplete }: Props) => {
  const [subtype, setSubtype] = useState<string>(SupportedJavascriptLibraries.React);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [invalidStepIndex, setInvalidStepIndex] = useState(-1);

  const locale = i18next.language;
  const guideKey = `${subtype}_${locale}`.toLowerCase();
  const GuideComponent = Guides[guideKey] ?? Guides[subtype];

  const methods = useForm<GuideForm>({ mode: 'onSubmit', reValidateMode: 'onChange' });
  const {
    formState: { isSubmitting },
    handleSubmit,
  } = methods;

  const onSubmit = handleSubmit((data) => {
    if (isSubmitting) {
      return;
    }
    void onComplete(data);
  });

  return (
    <Modal isOpen={isOpen} className={modalStyles.fullScreen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton size="large" onClick={onClose}>
            <Close />
          </IconButton>
          <div className={styles.separator} />
          <CardTitle
            size="small"
            title={<DangerousRaw>{appName}</DangerousRaw>}
            subtitle="applications.guide.header_description"
          />
          <Spacer />
          <Button type="plain" size="small" title="general.skip" onClick={onClose} />
          <Button
            type="outline"
            title="admin_console.applications.guide.get_sample_file"
            onClick={() => {
              onClickFetchSampleProject(subtype);
            }}
          />
        </div>
        <div className={styles.content}>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              {cloneElement(<LibrarySelector />, {
                className: styles.banner,
                onChange: setSubtype,
                onToggle: () => {
                  setActiveStepIndex(0);
                },
              })}
              <MDXProvider
                components={{
                  code: ({ className, children }) => {
                    const [, language] = /language-(\w+)/.exec(className ?? '') ?? [];

                    return <CodeEditor isReadonly language={language} value={String(children)} />;
                  },
                }}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  {GuideComponent && (
                    <GuideComponent
                      activeStepIndex={activeStepIndex}
                      invalidStepIndex={invalidStepIndex}
                      onNext={(nextIndex: number) => {
                        setActiveStepIndex(nextIndex);
                      }}
                      onError={(invalidIndex: number) => {
                        setInvalidStepIndex(invalidIndex);
                      }}
                    />
                  )}
                </Suspense>
              </MDXProvider>
            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
};

export default GuideModal;
