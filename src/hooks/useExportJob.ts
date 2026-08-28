'use client';

import { useState, useCallback, useRef } from 'react';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';

export interface ExportJobInfo {
    id: string;
    jobType: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    fileName?: string;
    fileSize?: number;
    errorLog?: string;
    createdAt?: string;
    updatedAt?: string;
    downloadUrl?: string;
}

export function useExportJob() {
    const { notifySuccess, notifyError, notifyInfo, notifyWarning } = useNotification();
    const [isExporting, setIsExporting] = useState(false);
    const [currentJob, setCurrentJob] = useState<ExportJobInfo | null>(null);
    const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

    const downloadFile = useCallback(async (jobId: string, customFileName?: string) => {
        try {
            const response: any = await apiClient.get(`/v1/exports/jobs/${jobId}/download`, {
                responseType: 'blob'
            });

            // apiClient interceptor returns response.data directly
            const blobData = (response instanceof Blob)
                ? response
                : (response?.data instanceof Blob
                    ? response.data
                    : new Blob([response], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }));

            const url = window.URL.createObjectURL(blobData);
            const a = document.createElement('a');
            a.href = url;
            a.download = customFileName || `Danh_sach_doi_tac_${new Date().getTime()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            notifyError('Lỗi tải file', 'Không thể tải file về máy, vui lòng thử lại sau.');
        }
    }, [notifyError]);

    const pollJobStatus = useCallback((jobId: string, fileName?: string, maxAttempts = 60) => {
        let attempts = 0;

        const checkStatus = async () => {
            attempts++;
            try {
                const res: any = await apiClient.get(`/v1/exports/jobs/${jobId}`);
                const jobData: ExportJobInfo = res.data?.data || res.data || res;
                setCurrentJob(jobData);

                if (jobData.status === 'COMPLETED') {
                    setIsExporting(false);
                    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
                    notifySuccess(
                        'Xuất file thành công',
                        `File "${jobData.fileName || fileName || 'Dữ liệu Excel'}" đã sẵn sàng và đang được tải về.`
                    );
                    downloadFile(jobId, jobData.fileName || fileName);
                    return;
                }

                if (jobData.status === 'FAILED') {
                    setIsExporting(false);
                    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
                    notifyError(
                        'Xuất file thất bại',
                        jobData.errorLog || 'Tiến trình xuất file gặp lỗi xử lý dữ liệu.'
                    );
                    return;
                }

                if (attempts >= maxAttempts) {
                    setIsExporting(false);
                    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
                    notifyWarning(
                        'Thời gian xử lý quá lâu',
                        'File vẫn đang được xử lý trong nền. Bạn có thể vào mục "Xuất Excel" để tải sau khi hoàn tất.'
                    );
                }
            } catch (err) {
                // Ignore transient polling error
            }
        };

        // Poll every 1.5 seconds
        pollingTimerRef.current = setInterval(checkStatus, 1500);
        checkStatus(); // Run initial check immediately
    }, [downloadFile, notifyError, notifySuccess, notifyWarning]);

    const triggerExport = useCallback(async (jobType: string, payload?: any, fileName?: string) => {
        try {
            setIsExporting(true);
            notifyInfo(
                'Bắt đầu xuất dữ liệu',
                'Đang khởi tạo tiến trình xuất file trong nền, bạn có thể tiếp tục làm việc bình thường...'
            );

            const res: any = await apiClient.post('/v1/exports/jobs', {
                jobType,
                payload: payload ? JSON.stringify(payload) : null,
                fileName: fileName || `Export_${jobType}_${new Date().getTime()}.xlsx`
            });

            const createdJob: ExportJobInfo = res.data?.data || res.data || res;
            if (createdJob && createdJob.id) {
                setCurrentJob(createdJob);
                pollJobStatus(createdJob.id, createdJob.fileName || fileName);
            } else {
                throw new Error('Không nhận được mã tiến trình xuất file');
            }
        } catch (err: any) {
            setIsExporting(false);
            notifyError('Lỗi khởi tạo job', err.response?.data?.message || err.message || 'Không thể tạo yêu cầu xuất file');
        }
    }, [notifyError, notifyInfo, pollJobStatus]);

    return {
        isExporting,
        currentJob,
        triggerExport,
        downloadFile
    };
}
