import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';

interface AxiosInstance {
    request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R>;
}

@Injectable()
export class ItemsService {
    // http: any;
    baseURL: any = 'http://sunnyradadiya-001-site1.ftempurl.com/';

    public childPath(method: string, args: string, data?: any): Promise<any> {
        return axios.request<AxiosInstance>({
            method: method,
            url: this.baseURL + args,
            data: data,
            headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHVkeSIsImp0aSI6IjY4YTI1MDBjLTBkODQtNDY0My04OGUwLTg2MDJiMmU3YzcwMSIsImlhdCI6IjcvMjkvMjAyMyAxMjoxODoyNCBQTSIsIlVzZXJJZCI6IjEiLCJVc2VyTmFtZSI6ImFkbWluIiwiZXhwIjoxNjkwNjM2NzA0LCJpc3MiOiJ3d3cuc3R1ZHkuaW4iLCJhdWQiOiJ3d3cuc3R1ZHkuaW4ifQ.2bo1j0oxR9H5wi0P5_8eZqqK0zBARU33yiXu8-gM-t4"
            }
        })
    }

}