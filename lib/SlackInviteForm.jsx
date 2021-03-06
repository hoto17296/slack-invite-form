const React = require('react');
const request = require('superagent');
const style = require('./style.scss');

const INVITATION_STATUS = {
  UNSENT:  'unsent',  // 未送信
  SENDING: 'sending', // 送信中
  SUCCESS: 'success', // 送信成功
  ERROR:   'error',   // 送信失敗
};

const INVITATION_ERROR_MESSAGE = {
  empty_email:     'メールアドレスを入力してください。',
  invalid_email:   '有効なメールアドレスではありません。',
  already_in_team: '既に参加しているユーザーのメールアドレスです。',
  already_invited: '既に招待メールを送信済みです。',
  default:         '招待メールを送信できませんでした。',
}

class SlackInviteForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invitation_status: INVITATION_STATUS.UNSENT,
      error: null,
      info: { total: undefined, online: undefined },
    };

    // 参加人数とオンライン人数を取得
    request.get(props.api_base).end((err, res) => {
      if ( err ) { return }
      this.setState({ info: res.body });
    });
  }

  render() {
    const total = this.state.info.total === undefined ? '-' : this.state.info.total;
    const online = this.state.info.online === undefined ? '-' : this.state.info.online;
    const Success = this.state.invitation_status === INVITATION_STATUS.SUCCESS
      ? <p className="success">招待メールを送信しました！</p> : null;
    const errorMsg = this.getErrorMessage();
    const Error = errorMsg ? <p className="error">{errorMsg}</p> : null;
    const classes = [
      style.slack_invite_form,
      'status_' + this.state.invitation_status,
    ];
    return (
      <div className={classes.join(' ')}>
        <form onSubmit={this.onSubmit.bind(this)}>
          <label htmlFor="email"></label>
          <input type="text" name="email" id="email" placeholder="you@yourdomain.com" ref="email" />
          <a href="#" className="submit" onClick={this.onSubmit.bind(this)}></a>
        </form>
        {Success}
        {Error}
        <p className="slack_status">
          現在 {total} 人中 {online} 人がオンライン
        </p>
      </div>
    )
  }

  // 招待メールを送信
  onSubmit(event) {
    event.preventDefault();

    if ( this.state.invitation_status !== INVITATION_STATUS.UNSENT ) return;

    const email = this.getEmail();
    if ( email === null ) return this.handleError('empty_email');
    if ( email === false ) return this.handleError('invalid_email');

    this.setState({ invitation_status: INVITATION_STATUS.SENDING, error: null });

    request.post(this.props.api_base).send({email}).end((err, res) => {
      if ( err ) return this.handleError(err);
      res.body.ok
        ? this.setState({ invitation_status: INVITATION_STATUS.SUCCESS })
        : this.handleError(res.body.error);
    });
  }

  // フォームに入力された文字列が
  // ・ 有効なメールアドレス → 入力されたメールアドレス
  // ・ メールアドレスではない文字列 → false
  // ・ 何も入力されていない → null
  // を返す
  getEmail() {
    const email = this.refs.email.value;
    if ( email.trim() === '' ) return null;
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return email.match(regex) ? email : false;
  }

  // エラーメッセージを表示
  // １秒後にフォームを入力可能な状態に戻す
  handleError(msg) {
    this.setState({ invitation_status: INVITATION_STATUS.ERROR, error: msg });
    console.warn(msg); // eslint-disable-line no-console
    setTimeout(() => this.setState({ invitation_status: INVITATION_STATUS.UNSENT }), 1000);
  }

  // エラーメッセージを取得
  getErrorMessage() {
    if ( ! this.state.error ) { return null }
    return INVITATION_ERROR_MESSAGE[ this.state.error ] !== undefined
      ? INVITATION_ERROR_MESSAGE[ this.state.error ]
      : INVITATION_ERROR_MESSAGE.default;
  }
}

module.exports = SlackInviteForm;
