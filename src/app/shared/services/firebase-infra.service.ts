import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, OperatorFunction, pipe } from 'rxjs';
import 'rxjs/Rx';
import 'rxjs/add/operator/map'
import { map } from "rxjs/operators"; 
import { CategoryClass } from '../models/category-class.model';
import { WordClass } from '../models/word-class.model';
import { AuthService } from './auth.service';
import { ErrorInfra } from './error-infra.service';
import { User } from './user';
import { UserClass } from '../models/user-class.model';
import firebase from 'firebase/compat/app';
import { GameResult } from '../models/game-result.model';



@Injectable({
  providedIn: 'root'
})
export class FirebaseInfraService {

  usersCollection: AngularFirestoreCollection<User> | undefined;
  users: Observable<User[]> = new Observable<User[]>()

  categoriesCollection: AngularFirestoreCollection<CategoryClass> | undefined;
  categories: Observable<CategoryClass[]> = new Observable<CategoryClass[]>()

  wordsCollection: AngularFirestoreCollection<WordClass> | undefined;
  words: Observable<WordClass[]> = new Observable<WordClass[]>()

  patientsCollection: AngularFirestoreCollection<User> | undefined;
  patients: Observable<User[]> = new Observable<User[]>()

  gameResultsCollection: AngularFirestoreCollection<GameResult> | undefined;
  gameResults: Observable<GameResult[]> = new Observable<GameResult[]>()

  constructor(public afs: AngularFirestore, public authentication: AuthService, //public error: ErrorInfra
  ) {
    //first import the users collection , mainly to get the current users's attrs.
    this.importUsers()
    //const firestore = firebase.firestore();
  }

   //import all users from DB to Observable object
   public importUsers(){
    try{
      this.usersCollection = this.afs.collection<User>('users', ref => ref.orderBy('email', 'desc'));
      this.users = this.usersCollection.snapshotChanges().pipe(map((result:any[]) => {
      return result.map(a => {
          let temp = a.payload.doc.data() as User;
          return temp;
        });
      }));
    }
    catch(e){
     // this.error.simpleToast("Connection error");
    }
  }

  public importGameResults(){
    try{//ref => ref.where('userEmail', '==', this.authentication.userData.email )
      this.gameResultsCollection = this.afs.collection<GameResult>('gameResults', ref => ref.where('userEmail', '==', this.authentication.userData.email));
      this.gameResults = this.gameResultsCollection.snapshotChanges().pipe(map((result:any[]) => {
      return result.map(a => {
          let temp = a.payload.doc.data() as GameResult;
          temp.id = a.payload.doc.id;
          return temp;
        });
      }));
    }
    catch(e){
     // this.error.simpleToast("Connection error");
    }
  }

  public importGameResultsByEmail(email:string){
    try{//ref => ref.where('userEmail', '==', this.authentication.userData.email )
      this.gameResultsCollection = this.afs.collection<GameResult>('gameResults', ref => ref.where('userEmail', '==', email));
      this.gameResults = this.gameResultsCollection.snapshotChanges().pipe(map((result:any[]) => {
      return result.map(a => {
          let temp = a.payload.doc.data() as GameResult;
          temp.id = a.payload.doc.id;
          return temp;
        });
      }));
    }
    catch(e){
     // this.error.simpleToast("Connection error");
    }
  }

  public importCategories()
  {
    //Creating the categories collection of the CURRENT USER!!!!!!!! ha ha
    try{
      this.categoriesCollection = this.afs.collection<CategoryClass>('categories', ref => ref.orderBy('order','asc').where('userEmail', '==', this.authentication.userData.email));
      this.categories = this.categoriesCollection.snapshotChanges().pipe(map((result:any[]) => {
        return result.map(a => {
          let temp = a.payload.doc.data() as CategoryClass;
          temp.id = a.payload.doc.id;
          return temp;
        });
      }));
    }
    catch(e){
     // this.error.simpleToast("Connection error");
    }
  }

  public importCategoriesByEmail(email:string)
  {
    //Creating the categories collection of the CURRENT USER!!!!!!!! ha ha
    try{
      this.categoriesCollection = this.afs.collection<CategoryClass>('categories', ref => ref.orderBy('order','asc').where('userEmail', '==', email));
      this.categories = this.categoriesCollection.snapshotChanges().pipe(map((result:any[]) => {
        return result.map(a => {
          let temp = a.payload.doc.data() as CategoryClass;
          temp.id = a.payload.doc.id;
          return temp;
        });
      }));
    }
    catch(e){
     // this.error.simpleToast("Connection error");
    }
  }

  public importwords(category: CategoryClass)
  {
    try{
      //Creating the words collection of specific category of current user
      this.wordsCollection = this.afs.collection<WordClass>('words', ref => ref.orderBy('order','asc').where('categoryID','==',category.id));
      //this.wordsCollection = this.afs.collection<Phrase>('words', ref => ref.orderBy('name', 'asc'));
      this.words = this.wordsCollection.snapshotChanges().pipe(map((result:any[]) => {
        return result.map(a => {
          let temp = a.payload.doc.data() as WordClass;
          temp.id = a.payload.doc.id;
          return temp;
        });
      }));
    }
      catch(e){
       // this.error.simpleToast("Connection error");
      }
  }
  
  get getUsersObservable() {
    return this.users
  }

  addUser(user: User) {
    return this.usersCollection?.add(UserClass.toObject(user));
  }

  get getCategoriesObservable() {
    return this.categories;
  }

  addCategory(category: CategoryClass) {   
    return this.categoriesCollection?.add(CategoryClass.toObject(category)).then(function(){
    }).catch((e) =>{
      // this.error.simpleToast("הוספה נכשלה");
         console.log("הוספה נכשלה");
     })
  }

  removeCategory(category: CategoryClass){
    this.categoriesCollection?.doc(category.id ).delete().then(function() {
  }).catch((e) => {
     // this.error.simpleToast("מחיקה נכשלה");
  });
  }

  get getwordsObservable() {
    return this.words;
  }

  get getGameResultsObservable() {
    return this.gameResults;
  }

  addWord(word: WordClass) {
    return this.wordsCollection?.add(WordClass.toObject(word)).then(function(){
    }).catch((e) =>{
     // this.error.simpleToast("הוספה נכשלה");
        console.log("הוספה נכשלה");
    })
  }

  addGameResult(gameResult: GameResult) {
    return this.gameResultsCollection?.add(WordClass.toObject(gameResult)).then(function(){
    }).catch((e) =>{
     // this.error.simpleToast("הוספה נכשלה");
        console.log("הוספה נכשלה");
    })
  }



  removePhrase(phrase: WordClass){
    this.wordsCollection?.doc(phrase.id).delete().then(function() {
  }).catch((e) => {
      //this.error.simpleToast("מחיקה נכשלה");
  });
  }

  updateWord(word: WordClass){
    this.afs.doc('words/' + word.id).update(word);
  }

  updateCategory(category: CategoryClass){
    this.afs.doc('categories/' + category.id).update(category);
  }

  updateResult(result: GameResult){
    this.afs.doc('gameResults/' + result.id).update(result);
  }
  
  addPatient(email: string) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc( `users/${this.authentication.user.uid}` );
    const addPatient= firebase.firestore.FieldValue.arrayUnion(email) as unknown as string[];
    userRef.update({ listOfPatients: addPatient });
    console.log(this.authentication.user.listOfPatients);
  }

  removePatient(email:string)
  {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc( `users/${this.authentication.user.uid}` );
    const addPatient= firebase.firestore.FieldValue.arrayRemove(email) as unknown as string[];
    userRef.update({ listOfPatients: addPatient });
    console.log(this.authentication.user.listOfPatients);
  }
}


