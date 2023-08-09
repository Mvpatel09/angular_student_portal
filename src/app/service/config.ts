import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';

interface AxiosInstance {
    request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R>;
}

@Injectable()
export class ItemsService {
    // http: any;
    baseURL: any = 'http://mandreducation.com/StudyAPIPublish/';

    public childPath(method: string, args: string, data?: any): Promise<any> {
        return axios.request<AxiosInstance>({
            method: method,
            url: this.baseURL + args,
            data: data,
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
        })
    }

}