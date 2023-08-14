import { NgModule } from '@angular/core';

// import { TableModule } from 'app/main/tables/table/table.module';
import { ChaptersModule } from 'app/main/tables/chapters/datatables.module';
import { SubjectsModule } from 'app/main/tables/subjects/datatables.module';
import { TopicsModule } from 'app/main/tables/topics/datatables.module';
import { SubTopicsModule } from 'app/main/tables/subTopics/datatables.module';
import { CoursesModule } from './courses/datatables.module';
import { UserManagementModule } from './userManagement/datatables.module';
import { ExamsModule } from './exams/datatables.module';
import { QuestionBankModule } from './questionBank/datatables.module';
import { SemestersModule } from './semesters/datatables.module';
import { CollegesModule } from './colleges/datatables.module';
import { AddExamQuestionsModule } from './addExamQuestions/datatables.module';
import { ExamQuestionsListModule } from './examQuestionsList/datatables.module';
import { SlidersModule } from './sliders/datatables.module';

@NgModule({
  declarations: [],
  imports: [ChaptersModule, SubjectsModule, TopicsModule, SubTopicsModule, CoursesModule, UserManagementModule, ExamsModule, QuestionBankModule, SemestersModule, CollegesModule, AddExamQuestionsModule, ExamQuestionsListModule, SlidersModule]
})
export class TablesModule { }
