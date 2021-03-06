import { Component } from '@angular/core';
import { MyService } from "../../../../theme/services/backend/service";
import { AuthService } from '../../../../providers/auth.service';

import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BidModelComponent } from '../bid-model/bid-model.component';
import { Project } from "../../../../theme/models/project";
import { ProjectStatus } from "../../../../theme/models/projectStatus";


@Component({
    selector: 'my-work',
    templateUrl: './work.html',
    providers: [MyService],
})

export class MyWork {

    custom_search = false;
    bidStream: string = "bid";
    projectsStream: string = "projects";
    projectStatusStream: string = "ProjectStatus";
    bid_projects: Project[] = [];

    constructor(private _router: Router, private _service: MyService, public authService: AuthService, ) {

        _service.listStreamKeys(this.bidStream).then(data => {
            data.forEach(element => {
                let bid_key = element.key;

                if (localStorage.getItem("email") == bid_key.split("/")[1]) {
                    let project_id = bid_key.split("/")[0];

                    _service.listStreamKeyItems(this.projectStatusStream, project_id).then(pstatus => {
                        if (pstatus[pstatus.length - 1] != undefined){
                            let projectStatus: ProjectStatus = JSON.parse(this._service.Hex2String(pstatus[pstatus.length - 1].data.toString()));
                            if(projectStatus.status == "Open"){
                                _service.getstreamitem(this.projectsStream, project_id).then(projectdata => {
                                    let project: Project;
            
                                    _service.gettxoutdata(projectdata.txid).then(largedata => {
                                        project = JSON.parse(this._service.Hex2String(largedata.toString()));
                                        project.project_id = projectdata.txid;
                                        project.client = projectdata.publishers[0];
                                        this.bid_projects.push(project);
                                    }).catch(error => {
                                        console.log(error.message);
                                    });
                                }).catch(error => {
                                    console.log(error.message);
                                });
                            }
                        }
                    }).catch(error => {
                        console.log(error.message);
                    });
                }
            });

        }).catch(error => {
            console.log(error.message);
        });
    }

    ngOnInit() {
    }

    goToProject(id: string) {
        let link = ['/pages/work/project_details', id];
        this._router.navigate(link);
    }

}

