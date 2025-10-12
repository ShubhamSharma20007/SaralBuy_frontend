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
    
}
export default new RequirementService();
