/*
 MIT License

 Copyright (c) 2019 Temainfo Software

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
import {
  Component, ElementRef, EventEmitter, Input, Renderer2, ViewChild, Output, AfterViewInit,
  OnDestroy
} from '@angular/core';
import { ChatStatus } from './interfaces/chat-status.interface';
import { ChatContact } from './interfaces/chat-contact.interface';
import { ChatMessage } from './interfaces/chat-message.interface';
import { Status } from './enums/status.enum';
import { Subscription } from 'rxjs';
import { ChatService } from './services/chat.service';

@Component( {
  selector: 'tl-chatlist',
  templateUrl: './chatlist.html',
  styleUrls: [ './chatlist.scss' ],
} )
export class TlChatList implements AfterViewInit, OnDestroy {

  @Input() maxHeight = '450px';

  @Input() width = '400px';

  @Input() color = 'basic';

  @Input() loadingMessages = false;

  @Input() chatStatus: ChatStatus = {
    BUSY: '#ffc019',
    ONLINE: '#66cc99',
    OFFLINE: '#ff3100'
  };

  @Input() partner: ChatContact;

  @Input() user: ChatContact;

  @Input('contacts')
  set contacts( data: ChatContact[] ) {
    if (data && data.length > 0) {
      this._dataSource = data.filter((item) => item.id !== this.user.id);
    }
  }

  get contacts(): ChatContact[] {
    return this._dataSource;
  }

  @Output() sendMessage: EventEmitter<ChatMessage> = new EventEmitter();

  @Output() changeStatus: EventEmitter<any> = new EventEmitter();

  @Output() newMessages: EventEmitter<boolean> = new EventEmitter();

  @Output() selectContact: EventEmitter<any> = new EventEmitter();

  @ViewChild('content') content: ElementRef;

  public transform = '100px';

  public selected = 'ONLINE';

  public insideChat = false;

  public messages: ChatMessage[] = [];

  private _dataSource;

  private subscription = new Subscription();

  constructor(private renderer: Renderer2, private chatService: ChatService) {}

  get online() {
    return Status.ONLINE;
  }

  get offline() {
    return Status.OFFLINE;
  }

  get busy() {
    return Status.BUSY;
  }

  ngAfterViewInit() {
    this.chatService.chat = this;
  }

  animationContentDone(event: AnimationEvent) {
    if (event.animationName === 'showOffContent') {
      this.insideChat = true;
    }
  }

  getUnreadMessages(id: string | number) {
    if (this.messages.length > 0) {
      return this.messages.filter((item: ChatMessage) =>
      (!item.viewed && item.from.id === id) && (item.to.id === this.user.id) );
    }
    return [];
  }

  hasMessages() {
    return this.messages.filter((value) => !value.viewed && (value.to.id === this.user.id)).length > 0;
  }

  selectPartner(item: ChatContact) {
    this.updatePartner(item);
    this.selectContact.emit({ ...item, unreadMessages: this.getUnreadMessages(item.id) });
    this.renderer.setStyle(this.content.nativeElement, 'animation', 'showOffContent 0.2s forwards');
    this.readMessages( this.getUnreadMessages(item.id) );
    this.newMessages.emit( this.hasMessages() );
  }

  readMessages( messages: ChatMessage[] ) {
    this.messages.forEach((item) => {
      messages.forEach((value) => {
        if (JSON.stringify(item) === JSON.stringify(value)) {
          item.viewed = true;
        }
      });
    });
  }

  readAllMessages() {
    this.messages.forEach((item: ChatMessage, index, array) => item.viewed = true );
  }

  updatePartner(item: ChatContact) {
    this.partner = item;
  }

  loadMessages(messages: ChatMessage[]) {
    this.messages = messages;
    this.newMessages.emit( this.hasMessages() );
  }

  appendMessage(message: ChatMessage) {
    this.messages = [ ...this.messages, message ];
    this.newMessages.emit( this.hasMessages() );
  }

  setStatus(status: Status) {
    this.changeStatus.emit({ user: this.user, status: status });
  }

  onMessage(message: { value: string, time: Date }) {
    const msm = {
      to: this.partner,
      from: this.user,
      message: message.value,
      time: message.time,
      viewed: false
    };
    this.sendMessage.emit(msm);
    this.appendMessage(msm);
  }

  selectStatus(status) {
    if (status === 'ONLINE') {
      this.transform = '100px';
      this.selected = 'ONLINE';
    } else if (status === 'OFFLINE') {
      this.transform = '200px';
      this.selected = 'OFFLINE';
    } else {
      this.transform = '0';
      this.selected = 'CHAT';
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

