import instance from "@/lib/instance";

class RequirementService {
    getRecentRequiremnts(){
       return instance.get('requirement/recent-requirements').then(res => res.data?.data|| res.data)
    }

    getApprovedPendingRequirements() {
        return instance.get('/requirement/approved-pending', { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }
    getCompletedApprovedRequirements() {
        return instance.get('/requirement/completed-approved', { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }

    closeDeal(params: { productId: string; sellerId: string;buyerId:string, finalBudget: number }) {
        return instance.post('/requirement/close-deal', params, { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }

    getRequirementById(id: string) {
        return instance.get(`/requirement/get-requirement/${id}`, { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }

    getBidNotifications() {
        return instance.get('/requirement/bid-notifications', { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }

    checkClosedDeal(params: { productId: string; sellerId: string; buyerId: string }) {
        return instance.post('/requirement/closed-deal-check', params, { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }

    respondToCloseDeal(params: { dealId: string; action: 'accept' | 'reject' }) {
        return instance.post('/requirement/respond-close-deal', params, { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }

    deleteNotification(notificationId: string) {
        return instance.delete(`/product/notifications/${notificationId}`, { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }

    markNotificationsSeen(notificationIds: string[]) {
        return instance.post('/product/notifications/mark-seen', { notificationIds }, { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }
}
export default new RequirementService();
