export abstract class ValueObjects<Props> {
  protected props: Props

  protected constructor(props: Props) {
    this.props = props
  }
}
