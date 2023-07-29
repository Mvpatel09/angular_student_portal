import { NgModule } from '@angular/core';

// import { TableModule } from 'app/main/tables/table/table.module';
import { ChaptersModule } from 'app/main/tables/chapters/datatables.module';
import { SubjectsModule } from 'app/main/tables/subjects/datatables.module';
import { TopicsModule } from 'app/main/tables/topics/datatables.module';
import { SubTopicsModule } from 'app/main/tables/subTopics/datatables.module';

@NgModule({
  declarations: [],
  imports: [ChaptersModule, SubjectsModule, TopicsModule, SubTopicsModule]
})
export class TablesModule { }
